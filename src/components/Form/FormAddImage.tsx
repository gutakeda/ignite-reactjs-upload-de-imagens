import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface NewImageData {
  url: string;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();
  const acceptedFormatsRegex = /[\/.](gif|jpeg|png)$/i;

  const formValidations = {
    image: {
      // TODO REQUIRED, LESS THAN 10 MB AND ACCEPTED FORMATS VALIDATIONS
      required: "Arquivo obrigatório",
      validate: {
        lessThan10MB: file => file[0].size < 10000000 || "O arquivo deve ser menor que 10MB.",
        acceptedFormats: file => acceptedFormatsRegex.test(file[0].type) || "Somente são aceitos arquivos PNG, JPEG e GIF."
      }
    },
    title: {
      // TODO REQUIRED, MIN AND MAX LENGTH VALIDATIONS
      required: "Título obrigatório",
      minLength: {
        value: 2,
        message: "Mínimo de 2 caracteres"
      },
      maxLength: {
        value: 20,
        message: "Máximo de 20 caracteres"
      }
    },
    description: {
      // TODO REQUIRED, MAX LENGTH VALIDATIONS
      required: "Descrição obrigatória",
      maxLength: {
        value: 65,
        message: "Máximo de 65 caracteres"
      }
    },
  };

  const queryClient = useQueryClient();
  /*   const mutation = useMutation(
      // TODO MUTATION API POST REQUEST,
      {
        // TODO ONSUCCESS MUTATION
      }
    ); */

  const mutation = useMutation(
    async (image: NewImageData) => {
      await api.post('api/images', {
        ...image,
        url: imageUrl,
      });
    },
    {
      // TODO ONSUCCESS MUTATION
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit = async (data: NewImageData): Promise<void> => {
    try {
      // TODO SHOW ERROR TOAST IF IMAGE URL DOES NOT EXISTS
      // TODO EXECUTE ASYNC MUTATION
      // TODO SHOW SUCCESS TOAST

      if (!imageUrl) {
        toast({
          status: 'error',
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
        });
        return;
      }

      await mutation.mutateAsync(data);
      toast({
        status: "success",
        title: 'Imagem cadastrada',
        description:
          'Sua imagem foi cadastrada com sucesso.',
      });
    } catch {
      // TODO SHOW ERROR TOAST IF SUBMIT FAILED
      toast({
        status: "error",
        title: 'Falha no cadastro',
        description:
          'Ocorreu um erro ao tentar ao tentar cadastrar a sua imagem.',
      });
    } finally {
      // TODO CLEAN FORM, STATES AND CLOSE MODAL
      reset();
      setImageUrl("");
      setLocalImageUrl("");
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          // TODO SEND IMAGE ERRORS
          // TODO REGISTER IMAGE INPUT WITH VALIDATIONS
          {...register('image', formValidations.image)}
          error={errors.image}
        />

        <TextInput
          placeholder="Título da imagem..."
          // TODO SEND TITLE ERRORS
          // TODO REGISTER TITLE INPUT WITH VALIDATIONS
          {...register('title', formValidations.title)}
          error={errors.title}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          // TODO SEND DESCRIPTION ERRORS
          // TODO REGISTER DESCRIPTION INPUT WITH VALIDATIONS
          {...register('description', formValidations.description)}
          error={errors.description}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
