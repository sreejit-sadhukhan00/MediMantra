"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { gsap } from "gsap";
import { Search, CalendarDays, FileText, CalendarIcon, Clock, Star, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDoctorList } from "@/contexts/DoctorListContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Step1DoctorSelection({ 
  selectedDoctor,
  selectedDate,
  selectedTimeSlot,
  searchTerm,
  selectedSpecialty,
  onDoctorSelect, 
  onDateSelect,
  onTimeSlotSelect,
  onSearchChange,
  onSpecialtyChange,
  getAvailableTimeSlots,
  onNext
}) {
  const stepsRef = useRef(null);
  const doctorsRef = useRef(null);
  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);
  
  // Get doctors from context instead of using props
  const { doctors, specialties, loading, error } = useDoctorList();
  
  // Add dummy time slots if none available
  const getDummyTimeSlots = () => {
    const slots = [];
    let hour = 9;
    
    // Generate time slots from 9 AM to 5 PM
    while (hour < 17) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
      hour++;
    }
    
    return slots;
  };
  
  // Get time slots with fallback to dummy data
  const getTimeSlotsList = () => {
    const availableSlots = getAvailableTimeSlots?.() || [];
    return availableSlots.length > 0 ? availableSlots : getDummyTimeSlots();
  };
  
  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    // Check if doctor has name property (from context data structure)
    if (!doctor?.user) return false; // Skip doctors without user data
    
    const doctorName = `${doctor.user.firstName} ${doctor.user.lastName}`;
    const doctorSpecialties = doctor.specialties || [doctor.specialty];
    
    // Only filter by specialty if one is selected
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === "" || 
                           doctorSpecialties.some(s => s.toLowerCase() === selectedSpecialty.toLowerCase());
    
    // If no search term, just filter by specialty
    if (!searchTerm) return matchesSpecialty;
    
    // If search term exists, check both name and specialties
    const matchesSearch = doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorSpecialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && matchesSpecialty;
  });
   
  // GSAP animations
  useEffect(() => {
    console.log(doctors);
    // Steps animation
    gsap.from(".step-item", {
      scrollTrigger: {
        trigger: stepsRef.current,
        start: "top 80%"
      },
      y: 30,
      stagger: 0.2,
      duration: 0.6
    });
    
    // Doctor cards animation
    gsap.from(".doctor-card", {
      scrollTrigger: {
        trigger: doctorsRef.current,
        start: "top 80%"
      },
      y: 40,
      stagger: 0.15,
      duration: 0.7
    });
  }, []);
  
  // Format doctor for display
  const formatDoctor = (doctor) => {
    // Handle both API-returned doctor objects and hardcoded ones
    return {
      id: doctor._id || doctor.id,
      name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : doctor.name,
      specialty: doctor.specialties ? doctor.specialties[0] : doctor.specialty,
      specialties: doctor.specialties || [doctor.specialty],
      rating: doctor.averageRating || doctor.rating || 0,
      experience: doctor.experience ? `${doctor.experience} yrs` : doctor.experience || "N/A",
      location: doctor.clinicDetails?.address?.city || doctor.location || "N/A",
      price: doctor.consultationFee?.inPerson || doctor.price || 0,
      image: doctor.user?.profileImage || doctor.image || "/placeholder-doctor.jpg",
      nextAvailable: "Today"
    };
  };
  
  return (
    <div className="space-y-8">
      {/* Process explanation */}
      <div ref={stepsRef} className="grid md:grid-cols-3 gap-6 mb-8">
        {[{ 
            icon: <Search className="h-6 w-6 text-blue-500" />, 
            title: "Find Your Doctor", 
            desc: "Search by specialty, name, or browse our top-rated physicians." 
          },
          { 
            icon: <CalendarDays className="h-6 w-6 text-blue-500" />, 
            title: "Choose a Time Slot", 
            desc: "Select from available dates and times that work for your schedule." 
          },
          { 
            icon: <FileText className="h-6 w-6 text-blue-500" />, 
            title: "Complete Booking", 
            desc: "Fill in your information and we'll confirm your appointment." 
          },
        ].map((step, i) => (
          <Card key={i} className="step-item border-none shadow-md">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Doctors</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                id="search"
                placeholder="Doctor name or specialty..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Select onValueChange={onSpecialtyChange} value={selectedSpecialty}>
              <SelectTrigger id="specialty" className="mt-1.5">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1.5"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Doctor list */}
      <div ref={doctorsRef} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {loading 
              ? "Loading doctors..." 
              : `${filteredDoctors.length} Doctors Available`}
          </h2>
          <Select defaultValue="recommended">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="availability">Earliest Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          // Loading skeleton UI
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border overflow-hidden">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-9 w-full mt-auto" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error loading doctors</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No doctors match your search</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => {
              const formattedDoctor = formatDoctor(doctor);
              const isSelected = selectedDoctor && 
                                (selectedDoctor.id === formattedDoctor.id || 
                                 selectedDoctor._id === doctor._id);
              
              return (
                <Card 
                  key={formattedDoctor.id} 
                  className={cn(
                    "doctor-card border overflow-hidden transition-all hover:shadow-lg",
                    isSelected ? "ring-2 ring-blue-500" : ""
                  )}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Doctor image */}
                    <div className="md:w-1/3 h-48 md:h-auto relative bg-slate-200 dark:bg-slate-700">
                      <Image
                        src={formattedDoctor.image}
                        alt={formattedDoctor.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-doctor.jpg";
                        }}
                      />
                    </div>
                    
                    {/* Doctor info */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{formattedDoctor.name}</h3>
                          <p className="text-muted-foreground">{formattedDoctor.specialty}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          <Star className="h-3 w-3 fill-current" />
                          {formattedDoctor.rating}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formattedDoctor.experience}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{formattedDoctor.location}</span>
                        </div>
                        <div>
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                            ${formattedDoctor.price} / visit
                          </Badge>
                        </div>
                        <div>
                          <span className="text-green-600 font-medium">{formattedDoctor.nextAvailable}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <Button 
                          onClick={() => {
                            onDoctorSelect(doctor);
                            if (isSelected) {
                              setTimeSlotDialogOpen(true);
                            }
                          }}
                          className="w-full"
                          variant={isSelected ? "default" : "outline"}
                        >
                          {isSelected ? "Select Time" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Time slot selection popup */}
      <Dialog open={timeSlotDialogOpen && !!selectedDoctor} onOpenChange={setTimeSlotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Time Slot</DialogTitle>
          </DialogHeader>
          
          <div className="my-6">
            <h3 className="font-medium mb-2">Available on {format(selectedDate, "EEEE, MMMM d")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getTimeSlotsList().map((time) => (
                <Button
                  key={time}
                  variant={selectedTimeSlot === time ? "default" : "outline"}
                  className={cn(
                    "text-sm h-10",
                    selectedTimeSlot === time ? "bg-blue-600" : ""
                  )}
                  onClick={() => onTimeSlotSelect(time)}
                >
                  {time}
                </Button>
              ))}
              {getTimeSlotsList().length === 0 && (
                <p className="col-span-3 text-center text-muted-foreground py-2">
                  No time slots available for this date. Please select another date.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setTimeSlotDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedTimeSlot) {
                  setTimeSlotDialogOpen(false);
                  onNext();
                }
              }}
              disabled={!selectedTimeSlot}
            >
              Confirm
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Next button */}
      <div className="pt-8 flex justify-end">
        <Button 
          size="lg"
          onClick={() => {
            if (selectedDoctor && !selectedTimeSlot) {
              setTimeSlotDialogOpen(true);
            } else if (selectedDoctor && selectedTimeSlot) {
              onNext();
            }
          }}
          disabled={!selectedDoctor}
          className="min-w-[150px]"
        >
          {selectedTimeSlot ? "Continue" : "Select Time"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}