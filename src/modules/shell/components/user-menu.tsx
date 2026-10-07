"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { LogOut, Receipt, UserRound } from "lucide-react";
import { useLogout, useSession } from "@/modules/auth/hooks/use-auth";
import { useActiveOrders } from "@/modules/orders/hooks/use-orders";
import { UserAvatar } from "@/modules/shell/components/user-avatar";

const itemClassName =
  "text-foreground data-[highlighted]:bg-muted flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none select-none";

export function UserMenu() {
  const session = useSession();
  const logout = useLogout();
  const user = session.data;
  const { activeOrders } = useActiveOrders(!!user);
  const activeCount = activeOrders.length;

  if (!user) return null;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Menu da conta"
        className="focus-visible:ring-ring/50 relative rounded-full outline-none focus-visible:ring-3"
      >
        <UserAvatar name={user.name} />
        {activeCount > 0 && (
          <span
            aria-hidden
            className="bg-warning border-card absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
          />
        )}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="border-border bg-popover w-64 rounded-md border p-1.5 shadow-lg outline-none">
            <div className="px-2.5 py-2">
              <p className="text-foreground truncate text-sm font-semibold">
                {user.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
            </div>

            <Menu.Separator className="bg-border my-1 h-px" />

            <Menu.LinkItem
              render={<Link href="/pedidos" />}
              className={itemClassName}
            >
              <Receipt className="text-muted-foreground h-4 w-4" />
              <span className="flex-1">Meus pedidos</span>
              {activeCount > 0 && (
                <span
                  className="bg-warning/15 text-warning inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold"
                  aria-label={`${activeCount} em andamento`}
                >
                  {activeCount}
                </span>
              )}
            </Menu.LinkItem>
            <Menu.LinkItem
              render={<Link href="/conta" />}
              className={itemClassName}
            >
              <UserRound className="text-muted-foreground h-4 w-4" />
              Minha conta
            </Menu.LinkItem>

            <Menu.Separator className="bg-border my-1 h-px" />

            <Menu.Item
              className={itemClassName}
              onClick={() => logout.mutate()}
            >
              <LogOut className="text-muted-foreground h-4 w-4" />
              Sair
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
