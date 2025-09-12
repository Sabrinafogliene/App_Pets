import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [vetAccess, setVetAccess] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setPets([]);
      setVaccines([]);
      setConsultations([]);
      setMedications([]);
      setWeightRecords([]);
      setVetAccess([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', user.id).single();

    if (profile?.user_type === 'tutor') {
      const { data: petsData, error: petsError } = await supabase.from('pets').select('*').eq('user_id', user.id);
      if (petsData) setPets(petsData);
    } else if (profile?.user_type === 'vet') {
      const { data: accessData, error: accessError } = await supabase.from('vet_access').select('pet_id').eq('vet_id', user.id);
      if (accessData) {
        const petIds = accessData.map(a => a.pet_id);
        const { data: petsData, error: petsError } = await supabase.from('pets').select('*').in('id', petIds);
        if (petsData) setPets(petsData);
      }
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPet = async (pet) => {
    const { data, error } = await supabase
      .from('pets')
      .insert({ ...pet, user_id: user.id })
      .select()
      .single();
    if (data) setPets(prev => [...prev, data]);
    return { data, error };
  };

  const addVaccine = async (vaccine) => {
    const { data, error } = await supabase
      .from('vaccines')
      .insert({ ...vaccine, user_id: user.id })
      .select()
      .single();
    if (data) setVaccines(prev => [...prev, data]);
    return { data, error };
  };

  const addConsultation = async (consultation) => {
    const { data, error } = await supabase
      .from('consultations')
      .insert({ ...consultation, user_id: user.id })
      .select()
      .single();
    if (data) setConsultations(prev => [...prev, data]);
    return { data, error };
  };

  const addMedication = async (medication) => {
    const { data, error } = await supabase
      .from('medications')
      .insert({ ...medication, user_id: user.id })
      .select()
      .single();
    if (data) setMedications(prev => [...prev, data]);
    return { data, error };
  };

  const addWeightRecord = async (weightRecord) => {
    const { data, error } = await supabase
      .from('weight_records')
      .insert({ ...weightRecord, user_id: user.id })
      .select()
      .single();
    if (data) setWeightRecords(prev => [...prev, data]);
    return { data, error };
  };

  const grantVetAccess = async (vetId, petId) => {
    const { data, error } = await supabase
      .from('vet_access')
      .insert({ vet_id: vetId, pet_id: petId, tutor_id: user.id })
      .select()
      .single();
    if (data) setVetAccess(prev => [...prev, data]);
    return { data, error };
  };

  const revokeVetAccess = async (vetId, petId) => {
    const { error } = await supabase
      .from('vet_access')
      .delete()
      .match({ vet_id: vetId, pet_id: petId, tutor_id: user.id });
    if (!error) setVetAccess(prev => prev.filter(a => !(a.vet_id === vetId && a.pet_id === petId)));
    return { error };
  };

  const value = {
    pets,
    vaccines,
    consultations,
    medications,
    weightRecords,
    vetAccess,
    loading,
    addPet,
    addVaccine,
    addConsultation,
    addMedication,
    addWeightRecord,
    grantVetAccess,
    revokeVetAccess,
    fetchData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};