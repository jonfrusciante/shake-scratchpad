
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'


admin.initializeApp(functions.config().firebase);

import * as orgFunctions from './org'
import * as usersFunctions from './skusers'
import * as serverFunctions from './server-http'

// org

export const newOrgRequest =  orgFunctions.newOrgRequest;
export const onPrivateDocCreated = orgFunctions.onPrivateDocCreated;
export const onPrivateDocUpdated = orgFunctions.onPrivateDocUpdated;
export const onPrivateDocVersionCreated = orgFunctions.onPrivateDocVersionCreated;
export const onOrgDelete = orgFunctions.onOrgDelete;

// users
export const deleteUser =  usersFunctions.deleteUser;
export const updateUserInfo =  usersFunctions.updateUserInfo;


export const bigben =  serverFunctions.bigben;


//
