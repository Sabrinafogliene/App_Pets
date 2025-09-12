import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const AgendaPage = () => {
  const [form, setForm] = useState({
    return (
      <DashboardLayout>
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Agenda</h1>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Agendar Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="paciente">Paciente</Label>
                  <Input id="paciente" value={form.paciente} onChange={e => handleChange('paciente', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Consulta</Label>
                  <Input id="tipo" value={form.tipo} onChange={e => handleChange('tipo', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="datetime-local" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="local">Local</Label>
                  <Input id="local" value={form.local} onChange={e => handleChange('local', e.target.value)} required />
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">Agendar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {/* ...restante do conteúdo... */}
        </div>
      </DashboardLayout>
              <Input id="tipo" value={form.tipo} onChange={e => handleChange('tipo', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="datetime-local" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="local">Local</Label>
              <Input id="local" value={form.local} onChange={e => handleChange('local', e.target.value)} required />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">Agendar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultas Agendadas</CardTitle>
        </CardHeader>
        <CardContent>
          {consultas.length === 0 ? (
            <p className="text-gray-500">Nenhuma consulta agendada.</p>
          ) : (
            <div className="space-y-4">
              {consultas.map(con => (
                <div key={con.id} className="border rounded-lg p-4">
                  <p><strong>Paciente:</strong> {con.paciente}</p>
                  <p><strong>Tipo:</strong> {con.tipo}</p>
                  <p><strong>Data:</strong> {con.data}</p>
                  <p><strong>Local:</strong> {con.local}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaPage;
