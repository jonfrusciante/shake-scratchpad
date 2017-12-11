import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

interface Organization {
  id?: string;                    // DB id
  name: string;

  createdBy?: string;              // uid
  creationDate?: number;

  allowPublicAccess?: boolean;

  language?: string;                   // Determines language and page direction for all pages viewed by organization
  logo?: object;
  jumbotron?: object;

}

export const newOrgRequest = functions.firestore
  .document('orgRequested/{doc}').onCreate((event) => {
    const newOrg: Organization = event.data.data();
    // Firestore database
    const db = admin.firestore();
    const orgRef = db.collection('org').doc(newOrg.name).collection('publicData').doc('info');
    const usersRef = db.collection('org').doc(newOrg.name).collection('users').doc(newOrg.createdBy);
    usersRef.set({roles: {admin: true, editor: false, viewer: false}}).catch();
    orgRef.set({description: 'this is description', name: newOrg.name, createdBy: newOrg.createdBy})
      .then(() => {
        db.collection('orgRequested').doc(newOrg.name).delete()
          .catch();
      }).catch();

    return 0;

  });
