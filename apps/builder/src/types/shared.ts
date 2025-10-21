type SelectOption<AllowedOptions> = {
  value: AllowedOptions
  label: string
}

export type SelectOptions<AllowedOptions> = SelectOption<AllowedOptions>[]
