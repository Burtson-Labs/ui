import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@burtson-labs/ui';

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible defaultValue="sandbox" className="w-full max-w-md">
      <AccordionItem value="sandbox">
        <AccordionTrigger>Where do agent commands run?</AccordionTrigger>
        <AccordionContent>
          In a container with no network and a scrubbed environment, unless you approve more.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="models">
        <AccordionTrigger>Which models are supported?</AccordionTrigger>
        <AccordionContent>
          Local Ollama models, Bandit Cloud, or any OpenAI-compatible server.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="license">
        <AccordionTrigger>Is it open source?</AccordionTrigger>
        <AccordionContent>Yes. Burtson UI is MIT licensed.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
