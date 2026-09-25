import * as React from 'react';

import { Field, FieldDescription, FieldLabel, Slider } from '@burtson-labs/ui';

export default function SliderDemo() {
  const [strength, setStrength] = React.useState(45);
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="strength">Edit strength · {strength}%</FieldLabel>
      <Slider
        id="strength"
        value={strength}
        onValueChange={setStrength}
        aria-valuetext={`${strength}% change`}
      />
      <FieldDescription>How far the result may move from the reference image.</FieldDescription>
    </Field>
  );
}
