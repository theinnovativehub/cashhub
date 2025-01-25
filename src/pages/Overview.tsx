import { Wallet, Users, CheckCircle } from "lucide-react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Task, Transaction } from "@/types/index";
import { useUserTasks, useUserTransactions, useUserBalance } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/skeleton";


export const Overview = () => {
  const { user } = useAuth();
  
  const { 
    data: recentTasks = [], 
    isLoading: tasksLoading 
  } = useUserTasks(user?.id || '');
  
  const { 
    data: recentTransactions = [], 
    isLoading: transactionsLoading 
  } = useUserTransactions(user?.id || '');
  
  const { 
    data: userBalance, 
    isLoading: balanceLoading 
  } = useUserBalance(user?.id || '');
  

  const isLoading = tasksLoading || transactionsLoading || balanceLoading;
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    {
      title: "Balance",
      value: userBalance?.balance || 0,
      icon: Wallet,color: "text-green-500",
      description: "Current balance"
    },
    {
      title: "Referrals",
      value: user?.num_referrals || 0,
      icon: Users,
      color: "text-blue-500",
      description: "Total referrals"
    },
    {
      title: "Tasks",
      value: recentTasks?.length || 0,
      icon: CheckCircle,color: "text-yellow-500",
      description: "Tasks completed"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-xl border dark:border-[var(--card-border)] bg-purple-200/70 dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-xl p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{stat.title}</p>
                  <stat.icon className={"h-8 w-8 " + stat.color} />
                </div>
                <p className="text-2xl font-bold">
                  {stat.title === "Balance" ? formatAmount(stat.value) : stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow">
          <div className="p-6">
            <h3 className="font-semibold">Recent Tasks</h3>
            {isLoading ? (
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {recentTasks.slice(0, 5).map((task: Task) => (
                  <div key={task.id} className="flex items-center glass-card p-4 justify-between">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {/* <p className="text-sm text-muted-foreground">
                        {console.log(task.completed_at)}
                        {formatDate(task.completed_at || '')}
                      </p> */}
                    </div>
                    <p className="font-medium text-green-600">{formatAmount(task.reward)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow">
          <div className="p-6">
            <h3 className="font-semibold">Recent Transactions</h3>
            {isLoading ? (
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {recentTransactions.slice(0, 5).map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex items-center glass-card p-4 justify-between">
                    <div>
                      <p className="font-medium">{transaction.type.split('_').join(' ').charAt(0).toUpperCase() + transaction.type.split('_').join(' ').slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at || '')}
                      </p>
                    </div>
                    <span className={`font-medium ${transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
{formatAmount(transaction.amount)}
                      </span>
                    {/* <p className="font-medium">{formatAmount(transaction.amount)}</p> */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
