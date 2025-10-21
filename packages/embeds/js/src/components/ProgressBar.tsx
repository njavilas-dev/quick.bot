type Props = {
  value: number
}

export const ProgressBar = (props: Props) => (
  <div class="left-0 w-full z-[42424242] progress-bar ">
    <div
      class="absolute h-full transition-[width] duration-[250ms] ease-in-out progress-bar__fill"
      style={{
        width: `${props.value}%`,
      }}
    />
  </div>
)
