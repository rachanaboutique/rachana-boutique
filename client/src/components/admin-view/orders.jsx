import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Copy, Check } from "lucide-react";
import { useToast } from "../ui/use-toast";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const { orderList, orderDetails, isLoading } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Fetch order details on clicking view details button
  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  // Fetch all orders on component mount
  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);


  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Handler for search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter order list based on search query (order id)
  const filteredOrderList = searchQuery
    ? orderList.filter((orderItem) =>
        orderItem?._id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orderList;

  // Sort orders by date (recent to past)
  const sortedOrderList = filteredOrderList
    ? [...filteredOrderList].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      )
    : [];

  // Copy order ID to clipboard
  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      toast({
        title: "Order ID copied!",
        description: "Order ID has been copied to clipboard.",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedOrderId(null);
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy order ID to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (

   <>
    {isLoading ? (
      <div className="flex items-center justify-center w-full mt-36 mb-1">

        <span className="text-lg whitespace-nowrap px-2">Loading orders...</span>

      </div>
    ) : (
    <Card>
      <CardHeader>
        <CardTitle>All Orders (Paid Only)</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Badge className="bg-green-500 text-white">Payment Status: Paid</Badge>
          <span>Showing only orders with confirmed payments</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 w-1/3">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border rounded-md p-2"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrderList && sortedOrderList.length > 0
              ? sortedOrderList.map((orderItem) => (
                  <TableRow key={orderItem._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{orderItem?._id}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyOrderId(orderItem._id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === orderItem._id ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(orderItem?.orderDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-green-500"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.paymentStatus === "paid"
                            ? "bg-green-500"
                            : orderItem?.paymentStatus === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-600"
                        }`}
                      >
                        {orderItem?.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{orderItem?.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No paid orders found.</TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card> ) }
   </>
  );
}

export default AdminOrdersView;
