import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { api } from '../../lib/api';
import type { Customer } from '../../types';

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  document: z.string().min(1, 'Documento é obrigatório'),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(1, 'Estado é obrigatório'),
    zipCode: z.string().min(1, 'CEP é obrigatório'),
  }),
});

type CustomerForm = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
        address: customer.address,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
        },
      });
    }
  }, [customer, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CustomerForm) => api.post('/api/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CustomerForm) => api.put(`/api/customers/${customer?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
  });

  const onSubmit = (data: CustomerForm) => {
    if (customer) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{customer ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="name"
              label="Nome"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="phone"
              label="Telefone"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              id="document"
              label="CPF/CNPJ"
              error={errors.document?.message}
              {...register('document')}
            />
          </div>

          <h3 className="text-lg font-semibold pt-4">Endereço</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                id="street"
                label="Rua"
                error={errors.address?.street?.message}
                {...register('address.street')}
              />
            </div>
            <Input
              id="number"
              label="Número"
              error={errors.address?.number?.message}
              {...register('address.number')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="complement"
              label="Complemento"
              error={errors.address?.complement?.message}
              {...register('address.complement')}
            />
            <Input
              id="neighborhood"
              label="Bairro"
              error={errors.address?.neighborhood?.message}
              {...register('address.neighborhood')}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              id="city"
              label="Cidade"
              error={errors.address?.city?.message}
              {...register('address.city')}
            />
            <Input
              id="state"
              label="Estado"
              error={errors.address?.state?.message}
              {...register('address.state')}
            />
            <Input
              id="zipCode"
              label="CEP"
              error={errors.address?.zipCode?.message}
              {...register('address.zipCode')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {customer ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
