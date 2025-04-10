import { CustomerActivityResponse, CustomerProps } from "@/lib/types";
import { ArrowUpRight, UTM_PARAMETERS } from "@dub/ui";
import {
  capitalize,
  cn,
  COUNTRIES,
  currencyFormatter,
  getParamsFromURL,
  getPrettyUrl,
} from "@dub/utils";
import Link from "next/link";
import { Fragment, HTMLProps, useMemo } from "react";
import DeviceIcon from "../analytics/device-icon";

export function CustomerDetailsColumn({
  customer,
  customerActivity,
  isCustomerActivityLoading,
  workspaceSlug,
}: {
  customer?: CustomerProps;
  customerActivity?: CustomerActivityResponse;
  isCustomerActivityLoading: boolean;
  workspaceSlug?: string;
}) {
  const link = customerActivity?.link;
  const click = customerActivity?.events.find((e) => e.event === "click");

  // TODO: Remove
  if (click)
    click.url =
      "https://dub.co/brand?utm_source=dub&utm_medium=referral&utm_campaign=brand";

  const utmParams = useMemo(() => {
    if (!click?.url) return null;
    const allParams = getParamsFromURL(click.url);

    return UTM_PARAMETERS.map((p) => ({
      ...p,
      value: allParams?.[p.key],
    })).filter(({ value }) => value);
  }, [click?.url]);

  return (
    <div className="grid grid-cols-1 gap-6 overflow-hidden whitespace-nowrap text-sm text-neutral-900 min-[320px]:grid-cols-2 lg:grid-cols-1">
      <div className="flex flex-col gap-2">
        <DetailHeading>Details</DetailHeading>
        {customer ? (
          customer.country && (
            <ConditionalLink
              href={
                workspaceSlug
                  ? `/${workspaceSlug}/analytics?country=${encodeURIComponent(customer.country)}`
                  : undefined
              }
              target="_blank"
              linkClassName="underline-offset-2 hover:text-neutral-950 hover:underline"
            >
              <div className="flex items-center gap-2">
                <img
                  src={`https://hatscripts.github.io/circle-flags/flags/${customer.country.toLowerCase()}.svg`}
                  alt=""
                  className="size-3.5 shrink-0"
                />
                <span className="truncate">{COUNTRIES[customer.country]}</span>
              </div>
            </ConditionalLink>
          )
        ) : (
          <div className="h-5 w-24 animate-pulse rounded-md bg-neutral-100" />
        )}
        {click
          ? [
              {
                key: "os",
                icon: (
                  <DeviceIcon
                    display={capitalize(click.os)!}
                    tab="os"
                    className="size-3.5 shrink-0"
                  />
                ),
                value: click.os,
              },
              {
                key: "device",
                icon: (
                  <DeviceIcon
                    display={capitalize(click.device)!}
                    tab="devices"
                    className="size-3.5 shrink-0"
                  />
                ),
                value: click.device,
              },
              {
                key: "browser",
                icon: (
                  <DeviceIcon
                    display={capitalize(click.browser)!}
                    tab="browsers"
                    className="size-3.5 shrink-0"
                  />
                ),
                value: click.browser,
              },
            ]
              .filter(({ value }) => value)
              .map(({ key, icon, value }, idx) => (
                <ConditionalLink
                  href={
                    workspaceSlug
                      ? `/${workspaceSlug}/analytics?${key}=${encodeURIComponent(value)}`
                      : undefined
                  }
                  target="_blank"
                  linkClassName="underline-offset-2 hover:text-neutral-950 hover:underline"
                >
                  <span key={key} className="flex items-center gap-2">
                    {icon}
                    <span className="truncate">{value}</span>
                  </span>
                </ConditionalLink>
              ))
          : (isCustomerActivityLoading || !customer) && (
              <div className="h-5 w-12 animate-pulse rounded-md bg-neutral-100" />
            )}
      </div>

      <div className="flex flex-col gap-2">
        <DetailHeading>Customer since</DetailHeading>
        {customer ? (
          <span>
            {new Date(customer.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ) : (
          <div className="h-5 w-12 animate-pulse rounded-md bg-neutral-100" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <DetailHeading>Lifetime value</DetailHeading>
        {!customer || isCustomerActivityLoading ? (
          <div className="h-5 w-12 animate-pulse rounded-md bg-neutral-100" />
        ) : (
          <span>
            {customerActivity?.ltv !== undefined
              ? currencyFormatter(customerActivity.ltv / 100, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "-"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <DetailHeading>Referral link</DetailHeading>
        {!customer || isCustomerActivityLoading ? (
          <div className="h-5 w-12 animate-pulse rounded-md bg-neutral-100" />
        ) : link ? (
          <ConditionalLink
            href={
              workspaceSlug &&
              `/${workspaceSlug}/links/${link.domain}/${link.key}`
            }
            target="_blank"
            className="min-w-0 overflow-hidden truncate"
            linkClassName="underline-offset-2 hover:text-neutral-950 hover:underline"
          >
            {getPrettyUrl(link.shortLink)}
          </ConditionalLink>
        ) : (
          <span>-</span>
        )}
      </div>

      {utmParams && (
        <div className="flex flex-col gap-2">
          <DetailHeading>UTM</DetailHeading>
          <div className="grid w-full grid-cols-[min-content,minmax(0,1fr)] gap-x-4 gap-y-2 overflow-hidden">
            {utmParams.map(({ key, label, value }) => (
              <Fragment key={key}>
                <span className="truncate">{label}</span>
                <ConditionalLink
                  href={
                    workspaceSlug &&
                    `/${workspaceSlug}/analytics?${key}=${encodeURIComponent(value)}`
                  }
                  target="_blank"
                  className="truncate text-neutral-500"
                  linkClassName="underline-offset-2 hover:text-neutral-600 hover:underline"
                >
                  {value}
                </ConditionalLink>
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DetailHeading = ({
  className,
  ...rest
}: HTMLProps<HTMLHeadingElement>) => (
  <h2
    className={cn("font-semibold text-neutral-900", className)}
    {...rest}
  ></h2>
);

const ConditionalLink = ({
  ref: _,
  href,
  className,
  children,
  linkClassName,
  ...rest
}: HTMLProps<HTMLAnchorElement> & { linkClassName?: string }) => {
  return href ? (
    <Link
      href={href}
      className={cn("group flex items-center", className, linkClassName)}
      {...rest}
    >
      <div className="min-w-0 truncate">{children}</div>
      <ArrowUpRight className="ml-1 size-3 shrink-0 -translate-x-0.5 translate-y-0.5 opacity-0 transition-[transform,opacity] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
};
