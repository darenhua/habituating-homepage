import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Calendar, Code, Smartphone } from "lucide-react"

const formSchema = z.object({
  codingLevel: z.enum(["0", "1", "2"], {
    required_error: "Please select a coding level.",
  }),
  doomscrolled: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

interface DailyLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData & { date: string }) => void
  date?: Date
  isSubmitting?: boolean
  error?: string | null
}

export function DailyLoginModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  date = new Date(),
  isSubmitting = false,
  error = null
}: DailyLoginModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codingLevel: undefined,
      doomscrolled: false,
    },
  })

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      date: format(date, "yyyy-MM-dd"),
    })
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Habit Check-in
          </DialogTitle>
          <DialogDescription>Record your habits for {format(date, "EEEE, MMMM d, yyyy")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="codingLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Code className="h-4 w-4" />
                    How much did you code today?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="none" />
                        <label
                          htmlFor="none"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Didn't code
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="some" />
                        <label
                          htmlFor="some"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Coded a little
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="lots" />
                        <label
                          htmlFor="lots"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Coded a lot
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doomscrolled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      id="doomscrolled"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel
                      htmlFor="doomscrolled"
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <Smartphone className="h-4 w-4" />
                      Avoided doomscrolling
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Check this if you successfully avoided excessive social media/news scrolling today
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}