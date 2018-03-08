import { Injectable } from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {FirestoreService} from '../../core/firestore.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/count';
import {AuthService} from '../../core/auth.service';
import {promise} from 'selenium-webdriver';
import rejected = promise.rejected;

@Injectable()
export class OrgDocService {

  constructor(private afs: AngularFirestore,
              private firestoreService: FirestoreService,
              ) { }

  getOrgDocsAcks$ (orgId: string): Observable<any> {
    return this.firestoreService.colWithIds$(`org/${orgId}/docsAcks`)
      .map(docsAcks => {
        docsAcks.forEach(docAck => {
          this.afs.doc(`org/${orgId}/docs/${docAck.docId}`).valueChanges()
            .take(1)
            .subscribe((doc: any) => {
              docAck.docName = doc.name;
            });
        });
        return docsAcks;
      });
  }


  deleteOrgDocAckP(orgId: string, docAckId: string) {
    this.afs.collection(`org/${orgId}/users`).valueChanges()
      .take(1)
      .subscribe(orgUsers => {
        console.log(orgUsers);
        orgUsers.map((orgUser: any) => {
          console.log(orgUser);
          console.log(`org/${orgId}/users/${orgUser.uid}/docsAcks/${docAckId}`);
          this.afs.doc(`org/${orgId}/users/${orgUser.uid}/docsAcks/${docAckId}`)
            .delete();
        });
      });

    return this.afs.doc(`org/${orgId}/docsAcks/${docAckId}`).delete();
  }

  getDocAckUsers$(orgId: string, docAckId: string): Observable<any> {
    return this.firestoreService.colWithIds$(`org/${orgId}/users`)
      .map(resArray => {
        resArray.forEach(res => {
          this.afs.doc(`org/${orgId}/users/${res.id}/docsAcks/${docAckId}`).valueChanges()
            // .take(1)
            .subscribe((userSignature: any) => {
              if (userSignature) {
                res.isRequired = userSignature.isRequired ? userSignature.isRequired : false;
                res.hasSigned = userSignature.hasSigned ? userSignature.hasSigned : false;
                res.signedAt = userSignature.signedAt;
              } else {
                res.isRequired = false;
                res.hasSigned = false;
              }
            });
        });
        return resArray;
      });
  }

  isSignatureRequired$(orgId: string, uid: string, docId: string) {

    return this.firestoreService.colWithIds$(`org/${orgId}/users/${uid}/docsAcks`)
      .switchMap(docsAcks => {
        let docAckId = null;
        docsAcks.forEach((docAck: any) => {
          if (docAck.docId === docId && !docAck.hasSigned) {
            docAckId = docAck.id;
          }
        });
        return Observable.of(docAckId);
      });
  }

  userDocAckSign(orgId: string, uid: string, docAckId: string): Promise<any> {
    const timestamp = this.firestoreService.timestamp;
    return this.firestoreService.upsert(`org/${orgId}/userSignatures/${uid}`, {
      hasSigned: true,
      signedAt: timestamp,
      docAckId: docAckId
    });

  }

  getOrgPublishedDocs$(orgId): Observable<any> {
    return this.firestoreService.colWithIds$(`org/${orgId}/docs`)
      .map(docsArray => {
       const  res: Array<any> = new Array<any>();
       docsArray.map(doc => {
         if (doc.isPublish) {
           res.push(doc);
         }
       });
       return res;
      });
  }

  addOrgUserReqDocAck(orgId: string, docAckId: string, docAckName: string, docId: string, uid: string, userName: string): Promise<any> {
    const addDocAckToUser = this.firestoreService.upsert(`org/${orgId}/users/${uid}/docsAcks/${docAckId}`, {
      isRequired: true,
      docAckName: docAckName,
      docId: docId,
    });
    // const updateDocsAcksField =  this.updateDocsAcksFieldP(orgId, docAckId, 'requiredSignatures', 'inc');
    // const addUserToDocAck = this.firestoreService.upsert(`org/${orgId}/docsAcks/${docAckId}/users/${uid}`, {
    //   userName: userName
    // });
    const updateDocsAcksField =  this.incDocAckReqCounter(orgId, docAckId);
    const addUserToDocAck = this.afs.collection(`org/${orgId}/docsAcks/${docAckId}/users`).doc(uid).set( { userName} );
    return Promise.all([updateDocsAcksField, addDocAckToUser, addUserToDocAck])
      .catch(err => console.log(err));
  }

  removeOrgUserReqDocAck(orgId: string, docAckId: string, uid: string): Promise<any> {
    const removeDocAckFromUser = this.afs.doc(`org/${orgId}/users/${uid}/docsAcks/${docAckId}`).delete();
    // const updateDocsAcksField = this.updateDocsAcksFieldP(orgId, docAckId, 'requiredSignatures', 'dec');
    const updateDocsAcksField = this.decDocAckReqCounter(orgId, docAckId);

    const removeUserFromDocAck = this.afs.doc(`org/${orgId}/docsAcks/${docAckId}/users/${uid}`).delete();

    return Promise.all([updateDocsAcksField, removeDocAckFromUser, removeUserFromDocAck])
      .catch(err => console.log(err));
  }


  getOrgDocAck$(orgId: string, docAckId: string): Observable<any> {
    return this.afs.doc(`org/${orgId}/docsAcks/${docAckId}`).valueChanges();
  }

  getDocNameP(orgId: string, docId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.afs.doc(`org/${orgId}/docs/${docId}`).valueChanges()
        .take(1)
        .subscribe((doc: any) => {
          resolve(doc.name);
        });
    });
  }

  setDocAckData(orgId: string, docAckId: string, data ): Promise<any> {
    return this.afs.doc(`org/${orgId}/docsAcks/${docAckId}`)
      .update(data);
  }

  createNewDocAck(orgId: string, data): Promise<any> {
    return this.afs.collection(`org/${orgId}/docsAcks`).add(data);
  }

  updateReadAck(orgId: string, readAckId: string, data) {
    return this.firestoreService.upsert(`org/${orgId}/docsAcks/${readAckId}`, data);
  }

  incDocAckReqCounter(orgId: string, docAckId: string) {
    const docAckRef = this.afs.firestore.collection('org').doc(orgId).collection('docsAcks').doc(docAckId);

    return this.afs.firestore.runTransaction(transaction => {
      return transaction.get(docAckRef)
        .then(res => {
          const newRequiredSignatures = res.data().requiredSignatures + 1;

          transaction.update(docAckRef, {
            requiredSignatures: newRequiredSignatures
          });
        });
    });
  }

  decDocAckReqCounter(orgId: string, docAckId: string) {
    const docAckRef = this.afs.firestore.collection('org').doc(orgId).collection('docsAcks').doc(docAckId);

    return this.afs.firestore.runTransaction(transaction => {
      return transaction.get(docAckRef)
        .then(res => {
          const newRequiredSignatures = res.data().requiredSignatures - 1;

          transaction.update(docAckRef, {
            requiredSignatures: newRequiredSignatures
          });
        });
    });
  }
}
