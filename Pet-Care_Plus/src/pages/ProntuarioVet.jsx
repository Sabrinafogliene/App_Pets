
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Syringe, Pill, Stethoscope, Scale, Utensils } from 'lucide-react';
import { format } from 'date-fns';

const ProntuarioVet = () => {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      const { data, error } = await supabase.rpc('get_vet_patients');
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar pacientes', description: error.message });
      } else {
        setPatients(data || []);
      }
      setLoading(false);
    };
    fetchPatients();
  }, [user, supabase, toast]);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!selectedPatientId) return;
      setLoading(true);
      
      const [vaccines, consultations, medications, weight, food] = await Promise.all([
        supabase.from('vaccines').select('*').eq('pet_id', selectedPatientId).order('date', { ascending: false }),
        supabase.from('consultations').select('*').eq('pet_id', selectedPatientId).order('date', { ascending: false }),
        supabase.from('medications').select('*').eq('pet_id', selectedPatientId).order('created_at', { ascending: false }),
        supabase.from('weight_records').select('*').eq('pet_id', selectedPatientId).order('date', { ascending: false }),
        supabase.from('food_records').select('*').eq('pet_id', selectedPatientId).order('created_at', { ascending: false }),
      ]);

      setPatientData({
        vaccines: vaccines.data || [],
        consultations: consultations.data || [],
        medications: medications.data || [],
        weight: weight.data || [],
        food: food.data || [],
      });
      setLoading(false);
    };
    fetchPatientData();
  }, [selectedPatientId, supabase]);

  const renderRecords = (title, icon, records, fields, colorClass) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${colorClass}`}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {records.length > 0 ? (
          <ul className="space-y-2 border rounded p-2 max-h-64 overflow-y-auto">
            {records.map(record => (
              <li key={record.id} className="text-sm p-2">
                {fields.map(field => (
                  <p key={field.key}>
                    <span className="font-semibold">{field.label}: </span>
                    {field.isDate ? format(new Date(record[field.key]), 'dd/MM/yyyy') : record[field.key]}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">Prontuário</h1>
        <p className="text-gray-600">Acesse o prontuário completo dos seus pacientes.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-xl p-6 card-shadow">
        <div className="mb-6 max-w-sm">
          <label className="text-sm font-medium">Selecione um Paciente</label>
          <Select onValueChange={setSelectedPatientId} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um paciente..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading && selectedPatientId && <p>Carregando dados do paciente...</p>}
        
        {selectedPatientId && !loading && patientData && (
          <div className="grid gap-6 md:grid-cols-2">
            {renderRecords('Vacinas', <Syringe className="text-green-600 h-4 w-4" />, patientData.vaccines, [
              { key: 'name', label: 'Nome' },
              { key: 'date', label: 'Data', isDate: true },
              { key: 'next_dose', label: 'Próxima Dose', isDate: true },
            ], 'text-green-600')}
            {renderRecords('Consultas', <Stethoscope className="text-purple-600 h-4 w-4" />, patientData.consultations, [
              { key: 'type', label: 'Tipo' },
              { key: 'date', label: 'Data', isDate: true },
              { key: 'observations', label: 'Observações' },
            ], 'text-purple-600')}
            {renderRecords('Medicamentos', <Pill className="text-blue-600 h-4 w-4" />, patientData.medications, [
              { key: 'name', label: 'Nome' },
              { key: 'dosage', label: 'Dosagem' },
              { key: 'frequency', label: 'Frequência' },
            ], 'text-blue-600')}
            {renderRecords('Peso', <Scale className="text-yellow-600 h-4 w-4" />, patientData.weight, [
              { key: 'weight', label: 'Peso (kg)' },
              { key: 'date', label: 'Data', isDate: true },
            ], 'text-yellow-600')}
            {renderRecords('Alimentação', <Utensils className="text-orange-600 h-4 w-4" />, patientData.food, [
              { key: 'brand', label: 'Marca' },
              { key: 'type', label: 'Tipo' },
              { key: 'quantity', label: 'Quantidade' },
            ], 'text-orange-600')}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProntuarioVet;
