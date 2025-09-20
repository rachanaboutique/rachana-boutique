import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { useState, useEffect } from "react";
import { getStateNameByCode } from "@/utils/locationUtils";
import { Loader2 } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  const [stateName, setStateName] = useState(addressInfo?.state || '');
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Function to format address with proper line breaks
  const formatAddress = (address) => {
    if (!address) return 'N/A';

    // If address contains commas, split and format each part on new line
    if (address.includes(',')) {
      return address.split(',').map((part, index) => (
        <span key={index} className="block">
          {part.trim()}
        </span>
      ));
    }

    // If no commas, return as is
    return address;
  };

  // Resolve state name if it's a code
  useEffect(() => {
    const resolveStateName = async () => {
      if (addressInfo?.state) {
        if (addressInfo.state.length <= 3) {
          // It's likely a state code, resolve to name
          setIsLoadingState(true);
          try {
            const result = getStateNameByCode(addressInfo.state);
            // Handle both synchronous and asynchronous returns
            const resolvedName = (typeof result === 'string') ? result : await result;
            setStateName(resolvedName || addressInfo.state);
          } catch (error) {
            setStateName(addressInfo.state);
          } finally {
            setIsLoadingState(false);
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
        {addressInfo?.name && <Label>Name: {addressInfo.name}</Label>}
        <Label>Address: {formatAddress(addressInfo?.address)}</Label>
        {addressInfo?.state && (
          <Label>
            State: {isLoadingState ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-gray-500">Loading...</span>
              </span>
            ) : (
              stateName
            )}
          </Label>
        )}
        <Label>City: {addressInfo?.city}</Label>
        <Label>Pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        {addressInfo?.notes && <Label>Landmark: {addressInfo?.notes}</Label>}
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button onClick={() => handleEditAddress(addressInfo)}>Edit</Button>
        <Button onClick={() => handleDeleteAddress(addressInfo)}>Delete</Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
