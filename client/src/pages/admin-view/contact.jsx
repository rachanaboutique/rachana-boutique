import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllContacts, deleteContact } from "../../store/admin/contact-slice";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

const AdminContact = () => {
  const dispatch = useDispatch();

  // Access adminContact state from Redux store
  const { contactList, isLoading, error } = useSelector((state) => state.adminContact);

  // Local state for delete confirmation modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  // Open modal to confirm deletion
  const handleDeleteClick = (id) => {
    setSelectedContactId(id);
    setModalOpen(true);
  };

  // Confirm deletion of a contact
  const confirmDelete = () => {
    dispatch(deleteContact(selectedContactId));
    setModalOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading contacts...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : contactList && contactList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactList.map((contact) => (
                <TableRow key={contact._id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.message}</TableCell>
                  <TableCell>
                    {new Date(contact.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(contact._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">No contacts found.</p>
        )}
      </CardContent>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this contact?"
      />
    </Card>
  );
};

export default AdminContact;