
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Syringe, Stethoscope, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CalendarHeader = ({ currentMonth, onMonthChange }) => (
  <div className="flex items-center justify-between pb-4">
    <h2 className="text-lg font-semibold text-cyan-600 ">
      {format(currentMonth, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
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

const CalendarGrid = ({ currentMonth, events, onEventClick }) => {
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
        const dayEvents = events.filter(e => e.date.substring(0, 10) === format(day, 'yyyy-MM-dd'));
        return (
          <div key={day.toString()} className="border rounded-lg p-2 h-28 flex flex-col">
            <span className={cn("font-medium text-xs", isSameDay(new Date(), day) && "text-cyan-600")}>
              {format(day, 'd')}
            </span>
            <div className="mt-1 space-y-1 overflow-y-auto">
              {dayEvents.map(event => (
                <div key={event.id} className="text-xs p-1 rounded flex items-center cursor-pointer" style={{ backgroundColor: event.color }} onClick={() => onEventClick(event)}>
                  {event.type === 'Vacina' ? <Syringe className="text-green-600 h-3 w-3 mr-1" /> : <Stethoscope className="text-purple-600 h-3 w-3 mr-1" />}
                  {event.title} - {event.petName}
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventClick = (event) => {
      setSelectedEvent(event);
      setIsModalOpen(true);
    };

  useEffect(() => {
      const fetchEvents = async () => {
          if (!user) return;
          setLoading(true);
      
          try {

              const [vacinaResponse, consultaResponse] = await Promise.all([
                  supabase.from('vaccines')
                          .select(`
                              id, name, date, vet_id, pet_id, next_dose, 
                              pet:pets!inner (
                                  name, 
                                  tutor:profiles!pets_user_id_fkey (full_name)
                              )
                          `)
                          .eq('vet_id', user.id),
                  supabase.from('consultations')
                          .select(`
                              id, type, date, vet_id, pet_id, observations, 
                              pet:pets!inner (
                                  name, 
                                  tutor:profiles!pets_user_id_fkey (full_name)
                              )
                          `)
                          .eq('vet_id', user.id),
              ]);
        
              if (vacinaResponse.error) {
                  console.error("Erro ao buscar vacinas:", JSON.stringify(vacinaResponse.error, null, 2));
              }
              if (consultaResponse.error) {
                  console.error("Erro ao buscar consultas:", JSON.stringify(consultaResponse.error, null, 2));
                  throw new Error('Erro ao buscar dados da agenda');
              }
              if (vacinaResponse.error || consultaResponse.error) {
                  throw new Error('Erro ao buscar dados da agenda. Verifique o nome da chave estrangeira no console.');
              }
         
              const myEvents = [
                  ...(vacinaResponse.data || []).map(v => ({ 
                      id: `v-${v.id}`, 
                      title: v.name, 
                      date: v.date, 
                      type: 'Vacina', 
                      color: '#d1fae5', 
                      petName: v.pet?.name, 
                      tutorName: v.pet?.tutor?.full_name,
                      details: v 
                  })),
                  ...(consultaResponse.data || []).map(c => ({ 
                      id: `c-${c.id}`, 
                      title: c.type, 
                      date: c.date, 
                      type: 'Consulta', 
                      color: '#ede9fe', 
                      petName: c.pet?.name, 
                      tutorName: c.pet?.tutor?.full_name,
                      details: c 
                  })),
              ];
      
              const validEvents = myEvents.filter(event => event.tutorName);
            
              const invalidEvents = myEvents.filter(event => !event.tutorName);
              if (invalidEvents.length > 0) {
                  console.warn("Eventos com dados incompletos (sem tutor):", invalidEvents);
              }
              setEvents(myEvents);
      
          } catch (error) {
              toast({ variant: 'destructive', title: 'Erro ao carregar agenda', description: error.message });
          } finally {
              setLoading(false);
          }
      };
    fetchEvents();
  }, [user, supabase, toast]);

        
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-600 mb-2">Agenda</h1>
        <p className="text-gray-600">Visualize seus compromissos e consultas agendadas.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-xl p-6 card-shadow">
        {loading ? (
          <p>Carregando agenda...</p>
        ) : (
          <>
            <CalendarHeader currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
            <CalendarGrid currentMonth={currentMonth} events={events} onEventClick={handleEventClick} />
          </>
        )}
      </motion.div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>  
            <DialogTitle className=" text-center font-bold text-cyan-600 rounded border-b-2 border-gray-200 ">Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="pt-2 space-y-4">
              <div className="text-xl font-bold mb-2 text-cyan-600">
                {selectedEvent.type} - {selectedEvent.title}
              </div>
              <div className="flex flex-col space-y-2 text-sm">
                <p className="font-medium text-gray-700">Pet: <span className="font-normal text-gray-600">{selectedEvent.petName}</span></p>
                <p className="font-medium text-gray-700">Tutor: <span className="font-normal text-gray-600">{selectedEvent.tutorName || 'N/A'}</span></p>
                <p className="flex items-center space-x-1"><CalendarIcon className="h-4 w-4 text-cyan-600" />
                  <span className="font-medium text-gray-700">Data:</span> 
                  <span className="font-normal text-gray-600">{format(new Date(selectedEvent.date), 'dd/MM/yyyy', {locale: ptBR })}</span>
                </p>
              </div>  
              {selectedEvent.type === 'Consulta' && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="font-semibold mb-1 text-gray-600">Observações da Consulta:</h4> 
                  <p className="text-sm text-gray-500 italic">{selectedEvent.details.observations || 'Nenhuma observação registrada.'}</p>
                </div>
              )}
                
              {selectedEvent.type === 'Vacina' && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="font-semibold mb-1 text-cyan-600">Detalhes da Vacina:</h4> 
                  <p className="text-sm">
                    <span className="font-medium">Nome da Vacina:</span> {selectedEvent.details.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Próxima Dose:</span> {selectedEvent.details.next_dose ? 
                    <span className="text-red-600">{format(new Date(selectedEvent.details.next_dose), 'dd/MM/yyyy', {locale: ptBR })}</span> : 'Não agendada'}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaVet;
