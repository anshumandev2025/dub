import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import { ProBadgeTooltip } from "@/ui/shared/pro-badge-tooltip";
import {
  Button,
  InfoTooltip,
  Modal,
  SimpleTooltipContent,
  Tooltip,
  useKeyboardShortcut,
  useMediaQuery,
} from "@dub/ui";
import { CircleHalfDottedClock } from "@dub/ui/icons";
import {
  cn,
  formatDateTime,
  getDateTimeLocal,
  parseDateTime,
} from "@dub/utils";
import { useParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm, useFormContext, useWatch } from "react-hook-form";

function ExpirationModal({
  showExpirationModal,
  setShowExpirationModal,
}: {
  showExpirationModal: boolean;
  setShowExpirationModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { isMobile } = useMediaQuery();
  const id = useId();

  const {
    watch: watchParent,
    getValues: getValuesParent,
    setValue: setValueParent,
  } = useFormContext<LinkFormData>();

  const {
    watch,
    register,
    setValue,
    reset,
    formState: { isDirty, errors },
    handleSubmit,
  } = useForm<Pick<LinkFormData, "expiresAt" | "expiredUrl">>({
    values: {
      expiresAt: getValuesParent("expiresAt"),
      expiredUrl: getValuesParent("expiredUrl"),
    },
  });

  const [expiresAt] = watch(["expiresAt", "expiredUrl"]);
  const expiresAtParent = watchParent("expiresAt");

  const inputRef = useRef<HTMLInputElement>(null);

  // Hacky fix to focus the input automatically, not sure why autoFocus doesn't work here
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, []);

  return (
    <Modal
      showModal={showExpirationModal}
      setShowModal={setShowExpirationModal}
      className="sm:max-w-md"
    >
      <form
        className="px-5 py-4"
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit((data) => {
            setValueParent("expiresAt", data.expiresAt, {
              shouldDirty: true,
            });
            setValueParent("expiredUrl", data.expiredUrl, {
              shouldDirty: true,
            });
            setShowExpirationModal(false);
          })(e);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Link Expiration</h3>
            <ProBadgeTooltip
              content={
                <SimpleTooltipContent
                  title="Set an expiration date for your links – after which it won't be accessible."
                  cta="Learn more."
                  href="https://dub.co/help/article/link-expiration"
                />
              }
            />
          </div>
          <div className="max-md:hidden">
            <Tooltip
              content={
                <div className="px-2 py-1 text-xs text-neutral-700">
                  Press{" "}
                  <strong className="font-medium text-neutral-950">E</strong> to
                  open this quickly
                </div>
              }
              side="right"
            >
              <kbd className="flex size-6 cursor-default items-center justify-center rounded-md border border-neutral-200 font-sans text-xs text-neutral-950">
                E
              </kbd>
            </Tooltip>
          </div>
        </div>

        {/* Expiration Date */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${id}-expiresAt`}
              className="block text-sm font-medium text-neutral-700"
            >
              Date and Time
            </label>
          </div>
          <div className="mt-2 flex w-full items-center justify-between rounded-md border border-neutral-300 bg-white shadow-sm transition-all focus-within:border-neutral-800 focus-within:outline-none focus-within:ring-1 focus-within:ring-neutral-500">
            <input
              ref={inputRef}
              id={`${id}-expiresAt`}
              type="text"
              placeholder='E.g. "tomorrow at 5pm" or "in 2 hours"'
              defaultValue={expiresAt ? formatDateTime(expiresAt) : ""}
              onBlur={(e) => {
                if (e.target.value.length > 0) {
                  const parsedDateTime = parseDateTime(e.target.value);
                  if (parsedDateTime) {
                    setValue("expiresAt", parsedDateTime, {
                      shouldDirty: true,
                    });
                    e.target.value = formatDateTime(parsedDateTime);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputRef.current) {
                  e.preventDefault();
                  const parsedDateTime = parseDateTime(inputRef.current.value);
                  if (parsedDateTime) {
                    setValue("expiresAt", parsedDateTime, {
                      shouldDirty: true,
                    });
                    inputRef.current.value = formatDateTime(parsedDateTime);
                  }
                }
              }}
              className="flex-1 border-none bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-0 sm:text-sm"
            />
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={expiresAt ? getDateTimeLocal(expiresAt) : ""}
              onChange={(e) => {
                const expiryDate = new Date(e.target.value);
                setValue("expiresAt", expiryDate, { shouldDirty: true });
                if (inputRef.current) {
                  inputRef.current.value = formatDateTime(expiryDate);
                }
              }}
              className="w-[40px] border-none bg-transparent text-neutral-500 focus:outline-none focus:ring-0 sm:text-sm"
            />
          </div>
        </div>

        {/* Expiration URL */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${id}-expiredUrl`}
              className="block text-sm font-medium text-neutral-700"
            >
              Expiration URL
            </label>
            <InfoTooltip
              content={
                <SimpleTooltipContent
                  title="Redirect users to a specific URL when the link has expired."
                  cta="Learn more."
                  href="https://dub.co/help/article/link-expiration#setting-a-custom-expiration-url"
                />
              }
            />
          </div>
          <div className="mt-2 rounded-md shadow-sm">
            <input
              id={`${id}-expiredUrl`}
              type="text"
              autoFocus={!isMobile}
              placeholder="https://example.com"
              className={`${
                errors.expiredUrl
                  ? "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-500"
              } block w-full rounded-md focus:outline-none sm:text-sm`}
              {...register("expiredUrl")}
            />
          </div>
        </div>

        <a
          href="https://dub.co/help/article/link-expiration#setting-a-default-expiration-url-for-all-links-under-a-domain"
          target="_blank"
          className="group mt-2 flex items-center text-xs text-neutral-500 hover:text-neutral-700"
        >
          Set a default expiration URL for your domain
        </a>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {Boolean(expiresAtParent) && (
              <button
                type="button"
                className="text-xs font-medium text-neutral-700 transition-colors hover:text-neutral-950"
                onClick={() => {
                  setValueParent("expiresAt", null, { shouldDirty: true });
                  setValueParent("expiredUrl", null, { shouldDirty: true });
                  setShowExpirationModal(false);
                }}
              >
                Remove expiration
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              text="Cancel"
              className="h-9 w-fit"
              onClick={() => {
                reset();
                setShowExpirationModal(false);
              }}
            />
            <Button
              type="submit"
              variant="primary"
              text={expiresAtParent ? "Save" : "Add expiration"}
              className="h-9 w-fit"
              disabled={!isDirty}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function getExpirationLabel({
  expiresAt,
}: Pick<LinkFormData, "expiresAt">) {
  return expiresAt
    ? formatDateTime(expiresAt, { year: undefined })
    : "Expiration";
}

function ExpirationButton({
  setShowExpirationModal,
}: {
  setShowExpirationModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { control } = useFormContext<LinkFormData>();
  const expiresAt = useWatch({ control, name: "expiresAt" });

  const { link } = useParams() as { link: string | string[] };

  useKeyboardShortcut("e", () => setShowExpirationModal(true), {
    modal: link ? false : true,
  });

  return (
    <Button
      variant="secondary"
      text={getExpirationLabel({ expiresAt })}
      icon={
        <CircleHalfDottedClock
          className={cn("size-4", expiresAt && "text-blue-500")}
        />
      }
      className="h-8 w-fit gap-1.5 px-2.5 text-xs font-medium text-neutral-700"
      onClick={() => setShowExpirationModal(true)}
    />
  );
}

export function useExpirationModal() {
  const [showExpirationModal, setShowExpirationModal] = useState(false);

  const ExpirationModalCallback = useCallback(() => {
    return (
      <ExpirationModal
        showExpirationModal={showExpirationModal}
        setShowExpirationModal={setShowExpirationModal}
      />
    );
  }, [showExpirationModal, setShowExpirationModal]);

  const ExpirationButtonCallback = useCallback(() => {
    return <ExpirationButton setShowExpirationModal={setShowExpirationModal} />;
  }, [setShowExpirationModal]);

  return useMemo(
    () => ({
      setShowExpirationModal,
      ExpirationModal: ExpirationModalCallback,
      ExpirationButton: ExpirationButtonCallback,
    }),
    [setShowExpirationModal, ExpirationModalCallback, ExpirationButtonCallback],
  );
}
