The goal is to create a chrome extension that replaces my default chrome tab to be one that is a habit tracker. The habit tracker should motivate me to not skip a day twice, by visualizing the days where I've succeeded through a github commit history style heat-map.

The website will display yearly heatmaps and weekly habit trackers for myself. To log a habit, we show a modal that has a form that asks if each habit was completed for the day. This logging modal needs to be shown only once a day, if a habit was not already logged.

## Supabase Database Persistence Layer
- this is done, this is the data model:
```
CREATE TABLE habit_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  coding_level INTEGER CHECK (coding_level IN (0, 1, 2)),
  doomscrolled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_habit_date ON habit_tracking(date DESC);
```

### **Yearly Cal-Heatmap Integration & Configuration**
- 0a. read specs/cal-heatmap for more details
- Create reusable `HabitHeatmap` component that wraps cal-heatmap
- It takes up the entire screen
- Configure two separate cal-heatmap instances:
- Configure tooltips showing exact date and status
- Mapper function for data transformation from Supabase to cal-heatmap format

  **Coding Heatmap**:
  - Domain: month, SubDomain: day
  - Scale configuration:
    - Ordinal or threshold type
    - Domain: [0, 1, 2]
    - Range: ['#e5e7eb', '#22c55e', '#eab308'] (gray, green, yellow)

  **Doomscroll Heatmap**:
  - Same domain/subdomain structure
  - Scale configuration:
    - Binary (boolean mapped to 0/1)
    - Domain: [0, 1]
    - Range: ['#e5e7eb', '#22c55e'] (gray, green)

### Modal component
```
"use client"
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
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Code, Smartphone } from "lucide-react"

const formSchema = z.object({
  codingLevel: z.enum(["none", "light", "moderate", "heavy"], {
    required_error: "Please select a coding level.",
  }),
  doomscroll: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

interface HabitEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData & { date: string }) => void
  date?: Date
}

export function HabitEntryModal({ open, onOpenChange, onSubmit, date = new Date() }: HabitEntryModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codingLevel: undefined,
      doomscroll: false,
    },
  })

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      date: format(date, "yyyy-MM-dd"),
    })
    form.reset()
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
            Habit Entry
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
                    Coding Level
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <label
                          htmlFor="none"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          None
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <label
                          htmlFor="light"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Light (1-2h)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <label
                          htmlFor="moderate"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Moderate (3-5h)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="heavy" id="heavy" />
                        <label
                          htmlFor="heavy"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Heavy (6h+)
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
              name="doomscroll"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      id="doomscroll"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel
                      htmlFor="doomscroll"
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <Smartphone className="h-4 w-4" />
                      Excessive Doomscrolling
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Did you spend excessive time scrolling social media or news feeds today?
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

```
- Implement keyboard shortcuts (ESC to close, Enter to submit)
### Weekly habit tracker component
``` typescript
import { cn } from "@/lib/utils"

interface HabitTrackerProps {
  habitName: string
  dayStates: ("completed" | "missed" | "future")[]
  totalDays: number
}

export function HabitTracker({ habitName, dayStates, totalDays }: HabitTrackerProps) {
  const completedDays = dayStates.filter((state) => state === "completed").length

  return (
    <div className="bg-gray-100 rounded-2xl p-6 w-full">
      {/* Header with habit name and progress */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">{habitName}</h2>
        <span className="text-lg font-medium text-gray-900">
          {completedDays}/{totalDays} days
        </span>
      </div>

      {/* Progress circles */}
      <div className="flex items-center -space-x-2">
        {dayStates.map((state, index) => {
          if (state === "future") {
            // Future days: small centered dots
            return (
              <div key={index} className="translate-x-2 w-12 h-12 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
              </div>
            )
          }

          // Past days: full circles (completed or missed)
          return (
            <div
              key={index}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors border-2 border-white",
                state === "completed" ? "bg-orange-500" : "bg-gray-400",
              )}
            >
              {state === "completed" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  {/* Simple checkmark icon */}
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### **Data Flow & State Management**
- the screen should either be in weekly mode or yearly mode at one time (state of the app is one or the other)
	- clicking the keyboard key "z" changes between the two. By default it is weekly mode.
- on page load -- depending if state is weekly or yearly,
	- the app should call a function called `getWeekHabits` which queries that supabase table for habit history from the last week
	- or if on yearly the app should call `getYearHabits` which queries that supabase table for history since the start of the year, to fill up the heatmaps
	- both should return ordered in ascension
- if the first item in the responses is not todays date, that means todays habit is not yet logged, so the modal should be shown
- When the modal is completed, the data should be refetched so that its updated. an animate() function or something should fire when the data is refetched after modal submission for a subtle animation
- use react query

### **Subtle animations when a habit is logged**
- for the weekly tracker, the animation should have confetti using https://www.npmjs.com/package/js-confetti and the new completed circle should have a subtle scale-up entry animation
