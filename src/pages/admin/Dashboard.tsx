import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Task, Transaction } from "@/types/index";
import { showToast } from "@/utils/toast";
import { TaskManagement } from "@/components/admin/TaskManagement";

export const AdminDashboard = () => {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending withdrawals
        const withdrawalsRef = collection(db, "transactions");
        const withdrawalsQuery = query(
          withdrawalsRef,
          where("type", "==", "withdrawal_pending"),
          orderBy("createdAt", "desc")
        );
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        const withdrawalsData = withdrawalsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Transaction));
        setWithdrawals(withdrawalsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        showToast.error("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWithdrawalApproval = async (transactionId: string, approved: boolean) => {
    try {
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, {
        status: approved ? "completed" : "rejected",
        type: approved ? "withdrawal_completed" : "withdrawal_rejected",
        updatedAt: serverTimestamp()
      });

      // Remove the processed withdrawal from the list
      setWithdrawals(prev => prev.filter(w => w.id !== transactionId));
      showToast.success(`Withdrawal ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      showToast.error("Failed to process withdrawal");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <TaskManagement />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Withdrawals</h2>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No pending withdrawals</div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    User: <span className="font-medium">{withdrawal.userId}</span>
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    Amount: ₦{withdrawal.amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested at: {withdrawal.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleWithdrawalApproval(withdrawal.id, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleWithdrawalApproval(withdrawal.id, false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
