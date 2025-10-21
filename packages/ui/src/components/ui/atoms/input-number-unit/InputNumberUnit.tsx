import React, { useState } from 'react';
import { MenuItem, IconButton } from '@chakra-ui/react';
import { InputNumber, InputNumberProps } from '../input-number/InputNumber';
import { DropdownMenu } from '../../molecules';

export type InputUnitInputProps = {
  units?: string[];
  defaultUnit?: string;
  defaultValue?: string
  onChange?: (value?: string) => false | void
} & Omit<InputNumberProps, 'defaultValue' | 'value' | 'onChange'>

export const InputNumberUnit: React.FC<InputUnitInputProps> = ({
  units = ['px', '%', 'em', 'rem', 'vh', 'vw'],
  defaultUnit = 'px',
  defaultValue = `0px`,
  onChange,
  ...props
}) => {
  const match = defaultValue.match(/^(\d+)([a-z%]+)$/i);
  const initialValue = match ? parseFloat(match[1]) : 0;
  const initialUnit = match && units.includes(match[2]) ? match[2] : defaultUnit;

  const [unit, setUnit] = useState<string>(initialUnit);
  const [value, setValue] = useState<number>(initialValue);

  const handleChange = (val?: string | number) => {
    if (typeof val === 'number') {
      setValue(val);
      if (onChange) onChange(`${val}${unit}`);
    }
  };

  return (
    <InputNumber
      defaultValue={value}
      onChange={handleChange}
      leftIcon={
        <DropdownMenu
          matchWidth={false}
          placement='bottom-end'
          menuButton={unit}
          menuButtonProps={{
            as: IconButton,
            'aria-label': 'Select unit',
            variant: 'unstyled',
            bg: 'transparent',
          }}
        >
          {units.map((unit) => (
            <MenuItem
              key={unit}
              onClick={() => setUnit(unit)}
            >
              {unit}
            </MenuItem>
          ))}
        </DropdownMenu>
      }
      {...props}
    />
  );
};
