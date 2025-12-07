import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost'
  }
>

function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const variantClass = variant === 'ghost' ? 'button ghost' : 'button'
  const merged = className ? `${variantClass} ${className}`.trim() : variantClass

  return (
    <button className={merged} {...rest}>
      {children}
    </button>
  )
}

export default Button
