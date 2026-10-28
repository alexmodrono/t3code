import { useAtomValue } from "@effect/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { settlePromise } from "@t3tools/client-runtime/state/runtime";
import { refreshUsageLimits } from "@t3tools/client-runtime/state/usage";
import {
  collectLimitAccounts,
  collectLimitNotices,
  collectLimitPools,
  displayLimitWindows,
} from "@t3tools/shared/usageLimits";
import { ChevronRightIcon } from "lucide-react";
import { memo, useEffect, useEffectEvent, useState } from "react";

import { environmentPresentations } from "../../state/presentation";
import { serverEnvironment } from "../../state/server";
import { useAtomCommand } from "../../state/use-atom-command";
import { providerClients } from "../settings/providerDriverMeta";
import { Button } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { readUsagePagePreferences, saveUsagePagePreferences } from "../usage/usagePagePreferences";

export const SidebarSubscriptionUsage = memo(function SidebarSubscriptionUsage() {
  const navigate = useNavigate();
  const presentations = useAtomValue(environmentPresentations.presentationsWithProvidersAtom);
  const [now, setNow] = useState(() => Date.now());
  const refreshProviders = useAtomCommand(serverEnvironment.refreshProviders, {
    reportFailure: false,
  });
  const connected = [...presentations]
    .filter(([, p]) => p.connection.phase === "connected" && p.serverConfig !== null)
    .map(([id]) => id)
    .sort()
    .join(",");
  const refresh = useEffectEvent(async () => {
    await settlePromise(() =>
      Promise.all(
        [...presentations].map(([environmentId, p]) =>
          p.connection.phase === "connected" && p.serverConfig !== null
            ? refreshUsageLimits(
                environmentId,
                () => refreshProviders({ environmentId, input: {} }),
                true,
              )
            : undefined,
        ),
      ),
    );
    setNow(Date.now());
  });
  // oxlint-disable-next-line t3code/react-effect-budget -- Poll visible sidebar quotas through the shared five-minute refresh throttle.
  useEffect(() => {
    if (!connected) return;
    const tick = () => {
      if (document.visibilityState !== "hidden") void refresh();
    };
    tick();
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [connected]);

  const pools = collectLimitPools(collectLimitAccounts(presentations), now);
  const notices = collectLimitNotices(presentations);
  const openLimits = () => {
    saveUsagePagePreferences({ ...readUsagePagePreferences(), metric: "limits" });
    void navigate({ to: "/usage" });
  };

  return (
    <section
      aria-label="Subscription usage remaining"
      className="max-h-[35svh] shrink-0 overflow-y-auto border-t border-sidebar-border/60 px-2 pt-2 pb-1"
    >
      <div className="mb-1 flex items-center justify-between">
        <Button size="xs" variant="ghost" onClick={openLimits}>
          Usage remaining <ChevronRightIcon />
        </Button>
        <Tooltip>
          <TooltipTrigger
            render={<span className="text-3xs text-sidebar-muted-foreground" tabIndex={0} />}
          >
            Auto
          </TooltipTrigger>
          <TooltipPopup side="right">
            Updates automatically while T3 is visible, using the same five-minute refresh policy as
            Usage → Limits.
          </TooltipPopup>
        </Tooltip>
      </div>
      {pools.map((pool) => {
        const name = providerClients.get(pool.driver)?.label ?? pool.driver;
        const stale = pool.accounts.some(
          (account) =>
            account.limits.unavailable || now - Date.parse(account.limits.checkedAt) > 10 * 60_000,
        );
        return (
          <div key={pool.driver} className="mb-2.5">
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs font-medium text-sidebar-foreground">
              <span>{name}</span>
              <span className="text-3xs font-normal text-sidebar-muted-foreground">
                {stale
                  ? "Outdated"
                  : pool.accounts.length > 1
                    ? `${pool.accounts.length} accounts`
                    : null}
              </span>
            </div>
            {displayLimitWindows(pool).map((window) => {
              const reset = window.resets[0];
              const resetLabel = reset
                ? `Next reset ${new Date(reset.at).toLocaleString()}`
                : "Reset time not reported";
              return (
                <Tooltip key={window.id}>
                  <TooltipTrigger
                    render={
                      <div
                        className="mb-1.5 rounded-sm outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        tabIndex={0}
                      />
                    }
                  >
                    <div className="mb-0.5 flex justify-between gap-2 text-2xs text-sidebar-muted-foreground">
                      <span className="truncate">{window.label}</span>
                      <span className="shrink-0 tabular-nums">{window.remainingPercent}% left</span>
                    </div>
                    <div
                      role="meter"
                      aria-label={`${name} ${window.label} remaining`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={window.remainingPercent}
                      aria-valuetext={`${window.remainingPercent}% left. ${resetLabel}${stale ? ". Outdated reading" : ""}`}
                      className="h-1 rounded-full bg-sidebar-foreground/10"
                    >
                      <div
                        className={`h-full rounded-full ${window.remainingPercent < 20 ? "bg-warning" : "bg-sidebar-foreground/55"}`}
                        style={{ width: `${window.remainingPercent}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipPopup side="right">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span>
                        {name} · {window.label} · {window.remainingPercent}% left
                      </span>
                      <span>{resetLabel}</span>
                      {stale ? (
                        <span>Last reported values. Open Usage → Limits to refresh.</span>
                      ) : null}
                    </div>
                  </TooltipPopup>
                </Tooltip>
              );
            })}
          </div>
        );
      })}
      {pools.length === 0 || notices.length > 0 ? (
        <p className="text-2xs text-sidebar-muted-foreground">
          {pools.length === 0
            ? "No subscription limits reported yet."
            : "Some limits are unavailable. Open Usage for details."}
        </p>
      ) : null}
    </section>
  );
});
