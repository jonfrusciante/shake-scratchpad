import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'


const copyInitialDataPackage = function (newOrg, orgInfoRef, dataPackageRef) {
  dataPackageRef.get().then(function (doc) {

    const file = admin.storage().bucket().file('dataPackages/logos/pizza.png');
    console.log('Test if file exists');
    file.exists()
      .then( res => {
        console.log('Result = ', res);
      })
      .catch(err => {
        console.log('Error', err);
      })

    const newLocation = 'gs://orgs/' + newOrg.orgId + '/pizza.png';

    // file.download()
    //   .then( () => {
    //       console.log('success');
    //     }
    //   )
    //   .catch(err => {
    //     console.log('My error', err);
    //   });
    //
    // admin.storage().bucket().getFiles()
    //   .then((results) => {
    //     console.log('results = ', results);
    //
    //     const files = results[0];
    //
    //     files.forEach(file => {
    //       console.log(file.name);
    //     });
    //   })
    //   .catch();


    const initialLogoUrl = doc.data().logoUrl;
    orgInfoRef.update({logoUrl: doc.data().logoUrl});
  })
};

export const newOrgRequest = functions.firestore
  .document('orgRequested/{doc}').onCreate((event) => {
    const newOrg = event.data.data();
    const db = admin.firestore();
    const orgRootRef = db.collection('org').doc(newOrg.orgId);
    const orgInfoRef = db.collection('org').doc(newOrg.orgId).collection('publicData').doc('info');
    const usersRef = db.collection('users').doc(newOrg.createdBy).collection('orgs').doc(newOrg.orgId);
    const orgUserRef = db.collection('org').doc(newOrg.orgId).collection('users').doc(newOrg.createdBy);
    const dataPackageRef = db.collection('dataPackages').doc(newOrg.language).collection('sectors').doc(newOrg.sector);

    // set the root org
    orgRootRef.set({}, {merge: true})
      .then(() => orgInfoRef.set({    // then - insert public info
        orgId: newOrg.orgId,
        orgName: newOrg.orgName,
        language: newOrg.language,
        sector: newOrg.sector,
        createdBy: newOrg.createdBy
      }))
      .then(() => {
        //  insert initial data package
        copyInitialDataPackage(newOrg, orgInfoRef, dataPackageRef);

        // set user info in org users
        orgUserRef.set({
          displayName: newOrg.displayName,
          email: newOrg.email,
          photoURL: newOrg.photoURL,
          uid:newOrg.uid,
          roles: {admin: true, editor: false, viewer: false}}).catch();

        // set the org in the users collection under the userID
        usersRef.set({}).catch();
      })
      // delete orgRequested
      .then(() => db.collection('orgRequested').doc(newOrg.orgId).delete())
      .catch();

    return 0;

  });


