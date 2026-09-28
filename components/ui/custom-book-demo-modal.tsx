"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/config";

const TIME_SLOTS = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

export function CustomBookDemoModal({ className, text = "Book a Demo" }: { className?: string, text?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [context, setContext] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field
  const [consent, setConsent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd");
      fetch(`${API_BASE_URL}/api/demo-bookings/?date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBookedSlots(data);
          else setBookedSlots([]);
        })
        .catch(() => setBookedSlots([]));
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot || !name || !email || !consent) return;

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/demo-bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          context,
          website, // Pass honeypot value silently
          consent_given: consent, // Pass consent proof to DB
          date: format(date, "yyyy-MM-dd"),
          time_slot: timeSlot
        })
      });

      if (res.ok) {
        setSuccess(true);
        const dateStr = format(date, "yyyy-MM-dd");
        const freshSlots = await fetch(`${API_BASE_URL}/api/demo-bookings/?date=${dateStr}`).then(r => r.json());
        if (Array.isArray(freshSlots)) {
          setBookedSlots(freshSlots);
        }
      } else {
        const errData = await res.json();
        setErrorMessage(errData.detail || "This slot might have just been booked. Please try another one.");
        const dateStr = format(date, "yyyy-MM-dd");
        const freshSlots = await fetch(`${API_BASE_URL}/api/demo-bookings/?date=${dateStr}`).then(r => r.json());
        if (Array.isArray(freshSlots)) {
          setBookedSlots(freshSlots);
        }
        setTimeSlot(null);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setSuccess(false); setDate(undefined); setTimeSlot(null); } }}>
      <DialogTrigger asChild>
        <button className={className}>{text}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl dark:bg-gray-900">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Book a Demo</DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-4 md:px-6 md:py-4 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {success ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Confirmed!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Thank you, {name}. We'll see you on {date && format(date, "MMMM do, yyyy")} at {timeSlot}.</p>
              <Button className="mt-4 w-full max-w-xs mx-auto rounded-full" onClick={() => setOpen(false)}>Close Window</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
              {/* Left Column: Calendar & Time */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Select Date</Label>
                  <div className="mt-1 flex justify-center border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl p-0.5 bg-white dark:bg-gray-950">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date(new Date().setHours(0,0,0,0)) || d.getDay() === 0}
                      className="w-full text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {date && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Select Time (IST)</Label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      {TIME_SLOTS.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = timeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                              isBooked 
                                ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 line-through cursor-not-allowed border border-gray-100 dark:border-gray-700" 
                                : isSelected 
                                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md ring-2 ring-black dark:ring-white ring-offset-1 dark:ring-offset-gray-900" 
                                  : "bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:shadow-sm"
                            }`}
                            disabled={isBooked}
                            onClick={() => setTimeSlot(slot)}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Form */}
              <div className="border-t md:border-t-0 md:border-l md:pl-6 border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-3 h-full flex flex-col">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your Details</Label>
                  
                  <div className="space-y-1 mt-1">
                    <Label htmlFor="name" className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Name *</Label>
                    <Input id="name" required value={name} onChange={e => setName(e.target.value)} disabled={!timeSlot} className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white h-8 text-sm" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email *</Label>
                    <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={!timeSlot} className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white h-8 text-sm" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={!timeSlot} className="bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white h-8 text-sm" />
                  </div>
                  
                  <div className="space-y-1 flex-grow">
                    <Label htmlFor="context" className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Demo Context</Label>
                    <Textarea id="context" placeholder="What would you like to cover?" className="h-[60px] resize-none bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white text-sm" value={context} onChange={e => setContext(e.target.value)} disabled={!timeSlot} />
                  </div>

                  {/* Honeypot field - Invisible to humans, bots will blindly fill this in */}
                  <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
                  </div>

                  <div className="flex items-start space-x-2 pt-1">
                    <input type="checkbox" id="consent" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-black dark:focus:ring-white cursor-pointer" />
                    <Label htmlFor="consent" className="text-[10px] text-gray-500 dark:text-gray-400 font-normal leading-tight cursor-pointer">
                      I consent to the collection and processing of my personal data to schedule and conduct this demo, in accordance with DPDP and GDPR.
                    </Label>
                  </div>

                  <div className="pt-2">
                    {errorMessage && (
                      <p className="text-red-500 text-xs font-semibold mb-2 text-center animate-in fade-in">{errorMessage}</p>
                    )}
                    <Button type="submit" className="w-full h-10 text-sm font-bold bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all shadow-md hover:shadow-lg active:translate-y-0" disabled={!timeSlot || !consent || loading}>
                      {loading ? "Confirming..." : "Confirm Booking"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
