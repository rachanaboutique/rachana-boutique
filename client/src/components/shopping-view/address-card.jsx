import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { useState, useEffect } from "react";
import { getStateNameByCode } from "@/utils/locationUtils";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  const [stateName, setStateName] = useState(addressInfo?.state || '');

  // Resolve state name if it's a code
  useEffect(() => {
    const resolveStateName = async () => {
      if (addressInfo?.state) {
        if (addressInfo.state.length <= 3) {
          // It's likely a state code, resolve to name
          try {
            const resolvedName = await getStateNameByCode(addressInfo.state);
            setStateName(resolvedName);
          } catch (error) {
            setStateName(addressInfo.state);
          }
        } else {
          // It's already a state name
          setStateName(addressInfo.state);
        }
      }
    };

    resolveStateName();
  }, [addressInfo?.state]);

  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer border-red-700 ${
        selectedId?._id === addressInfo?._id
          ? "border-foreground border-[4px]"
          : "border-black"
      }`}
    >
      <CardContent className="grid p-4 gap-4">
        <Label>Address: {addressInfo?.address}</Label>
        {addressInfo?.state && (
          <Label>State: {stateName}</Label>
        )}
        <Label>City: {addressInfo?.city}</Label>
        <Label>Pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        {addressInfo?.notes && <Label>Notes: {addressInfo?.notes}</Label>}
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button onClick={() => handleEditAddress(addressInfo)}>Edit</Button>
        <Button onClick={() => handleDeleteAddress(addressInfo)}>Delete</Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
