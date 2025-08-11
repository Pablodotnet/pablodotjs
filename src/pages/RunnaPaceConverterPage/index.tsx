import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type ConversionResult = {
  runnaPace: string;
  lifeFitnessSpeed: string;
};

const formSchema = z.object({
  runnaPace: z.string().min(1, {
    message: 'Runna pace, example: 4.5, it will be taken as kph (km/h)',
  }),
});

const RunnaPaceConverterPage = () => {
  const [conversionResult, setConversionResult] =
    useState<ConversionResult>({ runnaPace: '', lifeFitnessSpeed: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      runnaPace: '1',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const result = calculateLifeFitnessSpeed(values);
    const conversionResult: ConversionResult = {
      runnaPace: values.runnaPace,
      lifeFitnessSpeed: result,
    };
    setConversionResult(conversionResult);
    setFormSubmitted(true);
  };

  const calculateLifeFitnessSpeed = ({ runnaPace }: { runnaPace: string }) => {
    const speed = parseFloat(runnaPace);
    if (isNaN(speed) || speed <= 0) {
      throw new Error('El valor de velocidad debe ser un número positivo');
    }

    const paceInMinutes = 60 / speed;
    const minutes = Math.floor(paceInMinutes);
    const seconds = Math.round((paceInMinutes - minutes) * 60);

    // Asegurar formato MM:SS con ceros si es necesario
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${minutes}:${paddedSeconds}`;
  };

  const handleClear = () => {
    setFormSubmitted(false);
    setConversionResult({ runnaPace: '', lifeFitnessSpeed: '' });
    form.reset();
  };

  if (formSubmitted) {
    return (
      <Card className='w-[450px]'>
        <CardHeader>
          <CardTitle>Runna Pace Converter for Life Fitness</CardTitle>
          <CardDescription>
            Set your Life Fitness running machine pace to:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center text-2xl font-bold'>
            {conversionResult.lifeFitnessSpeed} minutes per kilometer
          </div>
          <div className='mt-4 text-center text-sm text-muted-foreground'>
            Runna Pace: {conversionResult.runnaPace} kph
          </div>
          <div className='mt-4 text-center'>
            <Button className='mt-4' onClick={handleClear}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-[450px]'>
      <CardHeader>
        <CardTitle>Runna Pace Converter for Life Fitness</CardTitle>
        <CardDescription>
          Transform how much speed is in Life Fitness running machines the pace
          of Runna routine run.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name="runnaPace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Runna Pace</FormLabel>
                  <FormControl>
                    <Input placeholder="6.4" {...field} />
                  </FormControl>
                  <FormDescription>
                    Example: 6.4, it will be taken as kph (km/h).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='space-x-4'>
              <Button type='submit'>Calculate</Button>
              <Button type='button' onClick={handleClear} variant='outline'>
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RunnaPaceConverterPage;
