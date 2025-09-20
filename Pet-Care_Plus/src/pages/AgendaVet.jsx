
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Syringe, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CalendarHeader = ({ currentMonth, onMonthChange }) => (
  <div className="flex items-center justify-between pb-4">
    <h2 className="text-lg font-semibold text-gray-800">
      {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
    </h2>
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const CalendarGrid = ({ currentMonth, events }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDay = getDay(monthStart);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map(day => (
        <div key={day} className="text-center text-xs font-medium text-gray-500">{day}</div>
      ))}
      {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} />)}
      {days.map(day => {
        const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
        return (
          <div key={day.toString()} className="border rounded-lg p-2 h-28 flex flex-col">
            <span className={cn("font-medium text-xs", isSameDay(day, new Date()) && "text-blue-600")}>
              {format(day, 'd')}
            </span>
            <div className="mt-1 space-y-1 overflow-y-auto">
              {dayEvents.map(event => (
                <div key={event.id} className="text-xs p-1 rounded flex items-center" style={{ backgroundColor: event.color }}>
                  {event.type === 'vaccine' ? <Syringe className="h-3 w-3 mr-1" /> : <Stethoscope className="h-3 w-3 mr-1" />}
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AgendaVet = () => {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      setLoading(true);

      const { data: patients, error: patientsError } = await supabase.rpc('get_vet_patients');
      if (patientsError) {
        toast({ variant: 'destructive', title: 'Erro ao buscar pacientes', description: patientsError.message });
        setLoading(false);
        return;
      }
      
      const patientIds = patients.map(p => p.id);

      const { data: vaccines, error: vaccinesError } = await supabase
        .from('vaccines')
        .select('id, name, date')
        .in('pet_id', patientIds);

      const { data: consultations, error: consultationsError } = await supabase
        .from('consultations')
        .select('id, type, date')
        .in('pet_id', patientIds);

      if (vaccinesError || consultationsError) {
        toast({ variant: 'destructive', title: 'Erro ao buscar eventos' });
      } else {
        const vaccineEvents = (vaccines || []).map(v => ({ id: `v-${v.id}`, title: v.name, date: v.date, type: 'vaccine', color: '#dbeafe' }));
        const consultationEvents = (consultations || []).map(c => ({ id: `c-${c.id}`, title: c.type, date: c.date, type: 'consultation', color: '#e0e7ff' }));
        setEvents([...vaccineEvents, ...consultationEvents]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [user, supabase, toast]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">Agenda</h1>
        <p className="text-gray-600">Visualize seus compromissos e consultas agendadas.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-xl p-6 card-shadow">
        {loading ? (
          <p>Carregando agenda...</p>
        ) : (
          <>
            <CalendarHeader currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
            <CalendarGrid currentMonth={currentMonth} events={events} />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AgendaVet;
