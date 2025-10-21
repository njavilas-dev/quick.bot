type Props = {
  boxSize?: string
  width?: string
}

export const AvatarPlaceholder = ({ boxSize, width }: Props = {}) => {
  const size = boxSize || width || '2.5rem'

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      data-testid="avatar-placeholder"
    >
      <circle cx="12" cy="12" r="12" fill="#5DDE8A" />
      <g transform="translate(2.4,2.4) scale(0.8)">
        <path
          d="M14.085 18.295H5.272V9.679C5.272 7.121 7.357 5.075 9.875 5.075H14.046C16.603 5.075 18.649 7.161 18.649 9.679V13.692C18.689 16.210 16.643 18.295 14.085 18.295ZM6.492 17.115H14.125C16.013 17.115 17.548 15.580 17.548 13.692V9.679C17.548 7.790 16.013 6.256 14.125 6.256H9.915C8.026 6.256 6.492 7.790 6.492 9.679V17.115Z"
          fill="#fff"
        />
        <circle cx="11.961" cy="11.685" r="0.945" fill="#fff" />
        <circle cx="8.971" cy="11.685" r="0.945" fill="#fff" />
        <circle cx="15.030" cy="11.685" r="0.945" fill="#fff" />
      </g>
    </svg>
  )
}
