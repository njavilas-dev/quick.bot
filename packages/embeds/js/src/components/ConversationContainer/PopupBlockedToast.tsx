type Props = {
  url: string
  onLinkClick: () => void
}

export const PopupBlockedToast = (props: Props) => {
  return (
    <div
      class="w-full max-w-xs p-4 text-gray-500 bg-white shadow flex flex-col gap-2 toast--popup-blocked"
      role="alert"
    >
      <div class="flex flex-col gap-1">
        <span class=" text-sm font-normal text-gray-900">Popup blocked</span>
        <div class="text-sm font-normal">
          The bot wants to open a new tab but it was blocked by your browser. It needs a manual
          approval.
        </div>
      </div>

      <a
        href={props.url}
        target="_blank"
        class="py-1 px-4 justify-center text-sm font-normal text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 filter hover:brightness-90 active:brightness-75 transition-all duration-300 button"
        rel="noreferrer"
        onClick={() => props.onLinkClick()}
      >
        Continue in new tab
      </a>
    </div>
  )
}
