"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algolia_1 = require("./algolia");
admin.initializeApp(functions.config().firebase);
const copyInitialDataPackage = function (newOrg, orgInfoRef, dataPackageRef) {
    return dataPackageRef.get().then(doc => {
        const logo = admin.storage().bucket().file('dataPackages/logos/' + doc.data().logoFileName);
        const banner = admin.storage().bucket().file('dataPackages/banners/' + doc.data().bannerFileName);
        const newLogoLocation = 'orgs/' + newOrg.orgId + '/logo';
        const newBannerLocation = 'orgs/' + newOrg.orgId + '/banner';
        const logoP = logo.copy(newLogoLocation);
        const bannerP = banner.copy(newBannerLocation);
        return Promise.all([logoP, bannerP])
            .catch();
    });
};
const saveEditDoc = function (orgId, docId, data) {
    const editedDoc = new algolia_1.AlgoliaDoc;
    if (data.editVersion !== undefined) {
        editedDoc.name = data.editVersion.name;
        editedDoc.plainText = data.editVersion.plainText;
        editedDoc.docId = docId;
        editedDoc.docType = 'e';
        editedDoc.version = 0;
        editedDoc.objectID = docId + 'e';
        algolia_1.algoliaSaveDoc(orgId, editedDoc);
    }
};
const savePublishDoc = function (orgId, docId, data) {
    const publishedDoc = new algolia_1.AlgoliaDoc;
    if (data.editVersion !== undefined) {
        publishedDoc.name = data.publishVersion.name;
        publishedDoc.plainText = data.publishVersion.plainText;
        publishedDoc.docId = docId;
        publishedDoc.docType = 'p';
        publishedDoc.version = data.version;
        publishedDoc.objectID = docId + 'p';
        algolia_1.algoliaSaveDoc(orgId, publishedDoc);
    }
};
const saveVersionDoc = function (orgId, docId, data) {
    const versionDoc = new algolia_1.AlgoliaDoc;
    versionDoc.name = data.name;
    versionDoc.plainText = data.plainText;
    versionDoc.docId = docId;
    versionDoc.docType = 'v';
    versionDoc.version = data.version;
    versionDoc.objectID = docId + data.version;
    algolia_1.algoliaSaveDoc(orgId, versionDoc);
};
exports.onPrivateDocUpdated = functions.firestore.document('org/{orgId}/docs/{docId}').onUpdate((event) => {
    const orgId = event.resource.match("org/(.*)/docs")[1];
    const data = event.data.data();
    const docId = event.data.id;
    // edited Version
    saveEditDoc(orgId, docId, data);
    // published Version
    savePublishDoc(orgId, docId, data);
    return 0;
});
exports.onPrivateDocCreated = functions.firestore.document('org/{orgId}/docs/{docId}').onCreate((event) => {
    const orgId = event.resource.match("org/(.*)/docs")[1];
    const data = event.data.data();
    const docId = event.data.id;
    // edited Version
    saveEditDoc(orgId, docId, data);
    // published Version
    savePublishDoc(orgId, docId, data);
    return 0;
});
exports.onPrivateDocVersionCreated = functions.firestore.document('org/{orgId}/docs/{docId}/versions/{version}').onCreate((event) => {
    const orgId = event.resource.match("org/(.*)/docs")[1];
    const data = event.data.data();
    const docId = event.resource.match("docs/(.*)/versions")[1];
    saveVersionDoc(orgId, docId, data);
    return 0;
});
// export const newOrgRequest = functions.firestore
//   .document('orgRequested/{doc}').onCreate((event) => {
//     const newOrg = event.data.data();
//     const db = admin.firestore();
//     const orgRootRef = db.collection('org').doc(newOrg.orgId);
//     const orgInfoRef = db.collection('org').doc(newOrg.orgId).collection('publicData').doc('info');
//     const usersRef = db.collection('users').doc(newOrg.createdBy).collection('orgs').doc(newOrg.orgId);
//     const orgUserRef = db.collection('org').doc(newOrg.orgId).collection('users').doc(newOrg.createdBy);
//     const dataPackageRef = db.collection('dataPackages').doc(newOrg.language).collection('sectors').doc(newOrg.sector);
//
//     // set the root org
//     orgRootRef.set({'searchKey': ''}, {merge: true})
//       .then(() => {
//         orgInfoRef.set({    // then - insert public info
//           orgId: newOrg.orgId,
//           orgName: newOrg.orgName,
//           language: newOrg.language,
//           sector: newOrg.sector,
//           createdBy: newOrg.createdBy
//         });
//
//         copyInitialDataPackage(newOrg, orgInfoRef, dataPackageRef);
//
//         const searchKey = algoliaInitIndexAndGetSearchKey(newOrg.orgId);
//         orgRootRef.set({
//           searchKey: searchKey
//         });
//       })
//       .then(() => {
//         //  insert initial data package
//         // copyInitialDataPackage(newOrg, orgInfoRef, dataPackageRef);
//
//         // get org public search key
//         // const searchKey = algoliaInitIndexAndGetSearchKey(newOrg.orgId);
//         // orgRootRef.set({
//         //   searchKey: searchKey
//         // });
//
//         // set user info in org users
//         orgUserRef.set({
//           displayName: newOrg.displayName,
//           email: newOrg.email,
//           photoURL: newOrg.photoURL,
//           uid:newOrg.uid,
//           roles: {admin: true, editor: false, viewer: false}}).catch();
//
//         // set the org in the users collection under the userID
//         usersRef.set({}).catch();
//       })
//       // delete orgRequested
//       .then(() => db.collection('orgRequested').doc(newOrg.orgId).delete())
//       .catch();
//
//     return 0;
//
//   });
exports.newOrgRequest = functions.firestore
    .document('orgRequested/{doc}').onCreate((event) => {
    const newOrg = event.data.data();
    const db = admin.firestore();
    const orgRootRef = db.collection('org').doc(newOrg.orgId);
    const orgInfoRef = db.collection('org').doc(newOrg.orgId).collection('publicData').doc('info');
    const orgUserRef = db.collection('org').doc(newOrg.orgId).collection('users').doc(newOrg.createdBy);
    const usersRef = db.collection('users').doc(newOrg.createdBy).collection('orgs').doc(newOrg.orgId);
    const dataPackageRef = db.collection('dataPackages').doc(newOrg.language).collection('sectors').doc(newOrg.sector);
    // set the root org
    return orgRootRef.set({ 'searchKey': '' }, { merge: true })
        .then(() => {
        // set public info
        const setPublicInfo = orgInfoRef.set({
            orgId: newOrg.orgId,
            orgName: newOrg.orgName,
            language: newOrg.language,
            sector: newOrg.sector,
            createdBy: newOrg.createdBy
        });
        // set user info in org users
        const setUserInfo = orgUserRef.set({
            displayName: newOrg.displayName,
            email: newOrg.email,
            photoURL: newOrg.photoURL,
            uid: newOrg.uid,
            roles: { admin: true, editor: false, viewer: false }
        }).catch();
        // set org data in user
        const setOrgInUserRecord = usersRef.set({}).catch();
        // copy logo and banner package
        const copyImages = copyInitialDataPackage(newOrg, orgInfoRef, dataPackageRef);
        // set algolia search key
        const initAlgoliaIndex = algolia_1.algoliaInitIndex(newOrg.orgId);
        const searchKey = algolia_1.algoliaGetSearchKey(newOrg.orgId);
        const setAlgoliaSearcKey = orgRootRef.set({
            searchKey: searchKey
        });
        return Promise.all([setPublicInfo, setUserInfo, setOrgInUserRecord, copyImages, setAlgoliaSearcKey, initAlgoliaIndex])
            .catch(err => console.log(err));
    })
        .then(() => {
        return db.collection('orgRequested').doc(newOrg.orgId).delete();
    })
        .then(() => { return 0; })
        .catch(() => { return 1; });
});
//# sourceMappingURL=org.js.map