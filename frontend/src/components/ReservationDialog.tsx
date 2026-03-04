import { useEffect, useState } from "react";
import {
  format,
  addDays,
  isBefore,
  startOfToday,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import type { Parking } from "@/lib/types/api/Parking";

const formSchema = z.object({
  spotId: z.string().min(1, "Veuillez sélectionner une place"),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.to >= data.from, {
      message: "La date de fin doit être après la date de début",
      path: ["to"],
    }),
  isElectric: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReservationDialogProps {
  selectedSpot: Parking | null;
  onReserved: (data: FormValues) => void;
}

export function ReservationDialog({
  selectedSpot,
  onReserved,
}: ReservationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const maxDays = user?.role === "MANAGER" ? 30 : 5;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotId: "",
      isElectric: false,
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
    },
  });

  // Update spotId when selectedSpot changes
  useEffect(() => {
    if (selectedSpot) {
      form.setValue("spotId", selectedSpot.id);
      form.setValue("isElectric", selectedSpot.hasElectricalTerminal);
    }
  }, [selectedSpot, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const diff =
      differenceInDays(values.dateRange.to, values.dateRange.from) + 1;

    if (diff > maxDays) {
      form.setError("dateRange.to", {
        message: `Vous ne pouvez pas réserver plus de ${maxDays} jours consécutifs.`,
      });
      return;
    }

    onReserved(values);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!selectedSpot} size="lg" className="w-full md:w-auto">
          Réserver la place{" "}
          {selectedSpot && `${selectedSpot?.code}${selectedSpot?.number}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Réservation</DialogTitle>
          <DialogDescription>
            Réservez votre place de parking. Maximum {maxDays} jours pour votre
            profil.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="spotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place sélectionnée</FormLabel>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                      disabled
                    >
                      {field.value || "Sélectionnez une place sur la carte"}
                    </Button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Période de réservation</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y", {
                                  locale: fr,
                                })}{" "}
                                -{" "}
                                {format(field.value.to, "LLL dd, y", {
                                  locale: fr,
                                })}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y", {
                                locale: fr,
                              })
                            )
                          ) : (
                            <span>Choisir une période</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={{
                          from: field.value?.from,
                          to: field.value?.to,
                        }}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                        disabled={
                          (date) =>
                            isBefore(date, startOfToday()) ||
                            isBefore(addDays(startOfToday(), 30), date) // Can't book too far in future for this demo
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Durée sélectionnée:{" "}
                    {field.value?.from && field.value?.to
                      ? differenceInDays(field.value.to, field.value.from) + 1
                      : 0}{" "}
                    jour(s)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full">
                Confirmer la réservation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
