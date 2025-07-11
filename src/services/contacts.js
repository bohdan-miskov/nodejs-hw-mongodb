import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
  return await ContactsCollection.find();
};

export const getContactById = async (id) => {
  return await ContactsCollection.findById(id);
};

export const createContact = async (payload) => {
  return await ContactsCollection.create(payload);
};

export const updateContact = async (contactId, payload, options = {}) => {
  return await ContactsCollection.findByIdAndUpdate(
    contactId,
    payload,
    options,
  );
};

export const deleteContact = async (contactId) => {
  return await ContactsCollection.findByIdAndDelete(contactId);
};
