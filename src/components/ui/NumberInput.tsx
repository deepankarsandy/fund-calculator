import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'min' | 'max' | 'step' | 'prefix'
> {
  value: number | string | undefined | null
  onChange?: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number | string
  allowEmpty?: boolean
  fallbackValue?: number
  integerOnly?: boolean
  validate?: (value: number) => number | undefined
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  containerClassName?: string
  prefixClassName?: string
  suffixClassName?: string
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      step,
      allowEmpty = false,
      fallbackValue,
      integerOnly = false,
      validate,
      prefix,
      suffix,
      containerClassName,
      prefixClassName,
      suffixClassName,
      className,
      onFocus,
      onBlur,
      onKeyDown,
      type = 'number',
      ...restProps
    },
    ref
  ) => {
    const formatValue = (val: number | string | undefined | null): string => {
      if (val === undefined || val === null || val === '') return ''
      return String(val)
    }

    const [localValue, setLocalValue] = useState<string>(() => formatValue(value))
    const [isFocused, setIsFocused] = useState(false)
    const prevPropRef = useRef(value)

    // Sync from external value changes when value prop changes and not focused
    useEffect(() => {
      if (value !== prevPropRef.current) {
        prevPropRef.current = value
        if (!isFocused) {
          setLocalValue(formatValue(value))
        }
      }
    }, [value, isFocused])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setLocalValue(raw)

      // On-change: DO NOT clamp or validate.
      // This allows user to blank the field and type intermediate numbers.
      if (raw === '') {
        if (allowEmpty) {
          onChange?.(undefined)
        }
        return
      }

      const parsed = Number(raw)
      if (!Number.isNaN(parsed)) {
        onChange?.(parsed)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)

      const trimmed = localValue.trim()

      if (trimmed === '') {
        if (allowEmpty) {
          setLocalValue('')
          onChange?.(undefined)
        } else {
          let fallback = fallbackValue !== undefined ? fallbackValue : min !== undefined ? min : 0
          if (min !== undefined && fallback < min) fallback = min
          if (max !== undefined && fallback > max) fallback = max
          if (integerOnly) fallback = Math.round(fallback)
          if (validate) {
            const custom = validate(fallback)
            if (typeof custom === 'number') fallback = custom
          }
          setLocalValue(String(fallback))
          onChange?.(fallback)
        }
      } else {
        let num = Number(trimmed)
        if (Number.isNaN(num)) {
          let fallback = fallbackValue !== undefined ? fallbackValue : min !== undefined ? min : 0
          if (min !== undefined && fallback < min) fallback = min
          if (max !== undefined && fallback > max) fallback = max
          if (integerOnly) fallback = Math.round(fallback)
          if (validate) {
            const custom = validate(fallback)
            if (typeof custom === 'number') fallback = custom
          }
          setLocalValue(String(fallback))
          onChange?.(fallback)
        } else {
          if (integerOnly) {
            num = Math.round(num)
          }
          if (min !== undefined && num < min) {
            num = min
          }
          if (max !== undefined && num > max) {
            num = max
          }
          if (validate) {
            const custom = validate(num)
            if (typeof custom === 'number') num = custom
          }
          setLocalValue(String(num))
          onChange?.(num)
        }
      }

      onBlur?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur()
      }
      onKeyDown?.(e)
    }

    const inputElement = (
      <input
        ref={ref}
        type={type}
        min={min}
        max={max}
        step={step ?? 'any'}
        value={localValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          prefix && 'pl-7',
          suffix && 'pr-8',
          className
        )}
        {...restProps}
      />
    )

    if (prefix || suffix || containerClassName) {
      return (
        <div className={cn('relative flex items-center', containerClassName)}>
          {prefix && (
            <span
              className={cn(
                'absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none select-none',
                prefixClassName
              )}
            >
              {prefix}
            </span>
          )}
          {inputElement}
          {suffix && (
            <span
              className={cn(
                'absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none select-none',
                suffixClassName
              )}
            >
              {suffix}
            </span>
          )}
        </div>
      )
    }

    return inputElement
  }
)

NumberInput.displayName = 'NumberInput'
