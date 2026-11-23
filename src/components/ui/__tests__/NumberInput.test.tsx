import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NumberInput, type NumberInputProps } from '../NumberInput'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )!.set!
  nativeInputValueSetter.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function fireFocus(input: HTMLInputElement) {
  input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
}

function fireBlur(input: HTMLInputElement) {
  input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
}

function ControlledWrapper(props: NumberInputProps) {
  const [val, setVal] = useState(props.value)
  return (
    <NumberInput
      {...props}
      value={val}
      onChange={(next) => {
        setVal(next)
        props.onChange?.(next)
      }}
    />
  )
}

describe('NumberInput', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container)
    }
    container = null
  })

  it('renders with initial value', () => {
    act(() => {
      createRoot(container!).render(<ControlledWrapper value={5000} onChange={vi.fn()} />)
    })
    const input = container?.querySelector('input') as HTMLInputElement
    expect(input).toBeDefined()
    expect(input.value).toBe('5000')
  })

  it('allows blanking the field while typing without 0 staying', () => {
    const handleChange = vi.fn()
    act(() => {
      createRoot(container!).render(<ControlledWrapper value={5000} onChange={handleChange} />)
    })
    const input = container?.querySelector('input') as HTMLInputElement

    act(() => {
      fireFocus(input)
    })

    // Simulate user clearing the input
    act(() => {
      setInputValue(input, '')
    })

    // Input value should be blank, not 0!
    expect(input.value).toBe('')

    // Type a new number '2'
    act(() => {
      setInputValue(input, '2')
    })
    expect(input.value).toBe('2')
    expect(handleChange).toHaveBeenCalledWith(2)

    // Type '25'
    act(() => {
      setInputValue(input, '25')
    })
    expect(input.value).toBe('25')
    expect(handleChange).toHaveBeenCalledWith(25)
  })

  it('validates on blur against min and max', () => {
    const handleChange = vi.fn()
    act(() => {
      createRoot(container!).render(
        <ControlledWrapper value={5000} min={1000} max={10000} onChange={handleChange} />
      )
    })
    const input = container?.querySelector('input') as HTMLInputElement

    act(() => {
      fireFocus(input)
    })

    // User types 50 (below min 1000)
    act(() => {
      setInputValue(input, '50')
    })
    // While typing, display is 50
    expect(input.value).toBe('50')

    // Blur triggers validation
    act(() => {
      fireBlur(input)
    })

    // Clamped to min 1000
    expect(input.value).toBe('1000')
    expect(handleChange).toHaveBeenLastCalledWith(1000)
  })

  it('validates on blur clamping to max', () => {
    const handleChange = vi.fn()
    act(() => {
      createRoot(container!).render(
        <ControlledWrapper value={5000} min={1000} max={10000} onChange={handleChange} />
      )
    })
    const input = container?.querySelector('input') as HTMLInputElement

    act(() => {
      fireFocus(input)
      setInputValue(input, '99999')
    })
    expect(input.value).toBe('99999')

    act(() => {
      fireBlur(input)
    })

    expect(input.value).toBe('10000')
    expect(handleChange).toHaveBeenLastCalledWith(10000)
  })

  it('falls back to fallbackValue or min on blur when left empty and allowEmpty is false', () => {
    const handleChange = vi.fn()
    act(() => {
      createRoot(container!).render(
        <ControlledWrapper value={5000} min={1000} fallbackValue={2000} onChange={handleChange} />
      )
    })
    const input = container?.querySelector('input') as HTMLInputElement

    act(() => {
      fireFocus(input)
      setInputValue(input, '')
    })
    expect(input.value).toBe('')

    act(() => {
      fireBlur(input)
    })

    expect(input.value).toBe('2000')
    expect(handleChange).toHaveBeenLastCalledWith(2000)
  })

  it('allows empty on blur when allowEmpty is true', () => {
    const handleChange = vi.fn()
    act(() => {
      createRoot(container!).render(
        <ControlledWrapper value={5000} allowEmpty={true} onChange={handleChange} />
      )
    })
    const input = container?.querySelector('input') as HTMLInputElement

    act(() => {
      fireFocus(input)
      setInputValue(input, '')
    })

    act(() => {
      fireBlur(input)
    })

    expect(input.value).toBe('')
    expect(handleChange).toHaveBeenLastCalledWith(undefined)
  })

  it('supports custom validate function on blur', () => {
    const handleChange = vi.fn()
    const customValidate = (val: number) => {
      return Math.round(val / 500) * 500
    }

    act(() => {
      createRoot(container!).render(
        <ControlledWrapper value={1000} validate={customValidate} onChange={handleChange} />
      )
    })
    const input = container?.querySelector('input') as HTMLInputElement

    act(() => {
      fireFocus(input)
      setInputValue(input, '1234')
    })

    act(() => {
      fireBlur(input)
    })

    expect(input.value).toBe('1000') // 1234 rounded to nearest 500 is 1000
    expect(handleChange).toHaveBeenLastCalledWith(1000)
  })

  it('updates display value when external prop changes while not focused', () => {
    let setValExternal: (val: number) => void = () => {}
    function TestComponent() {
      const [val, setVal] = useState(100)
      setValExternal = setVal
      return <NumberInput value={val} onChange={vi.fn()} />
    }

    act(() => {
      createRoot(container!).render(<TestComponent />)
    })
    const input = container?.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('100')

    act(() => {
      setValExternal(50000)
    })
    expect(input.value).toBe('50000')
  })

  it('renders prefix and suffix properly', () => {
    act(() => {
      createRoot(container!).render(
        <ControlledWrapper value={100} prefix="₹" suffix="%" onChange={vi.fn()} />
      )
    })
    expect(container?.textContent).toContain('₹')
    expect(container?.textContent).toContain('%')
  })
})
