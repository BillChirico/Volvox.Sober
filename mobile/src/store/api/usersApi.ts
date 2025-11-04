import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabaseClient } from '../../services/supabase';

export interface User {
  id: string;
  email: string;
  role: 'sponsor' | 'sponsee' | 'both';
  profile_photo_url?: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  program_type: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  location?: {
    city: string;
    state: string;
  };
  bio?: string;
  profile_photo_url?: string;
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query<User, string>({
      async queryFn(userId) {
        try {
          const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            return { error: { status: 'FETCH_ERROR', error: error.message } };
          }

          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['Profile'],
    }),

    // Update user profile
    updateProfile: builder.mutation<User, { userId: string; data: UpdateProfilePayload }>({
      async queryFn({ userId, data }) {
        try {
          const { data: updated, error } = await supabaseClient
            .from('users')
            .update(data)
            .eq('id', userId)
            .select()
            .single();

          if (error) {
            return { error: { status: 'CUSTOM_ERROR', error: error.message } };
          }

          return { data: updated };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['Profile'],
    }),

    // Upload profile photo
    uploadPhoto: builder.mutation<string, { userId: string; file: Blob; fileName: string }>({
      async queryFn({ userId, file, fileName }) {
        try {
          // Upload to Supabase Storage
          const { data, error } = await supabaseClient.storage
            .from('profile-photos')
            .upload(`${userId}/${fileName}`, file, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (error) {
            return { error: { status: 'CUSTOM_ERROR', error: error.message } };
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabaseClient.storage.from('profile-photos').getPublicUrl(`${userId}/${fileName}`);

          // Update user profile with photo URL
          const { error: updateError } = await supabaseClient
            .from('users')
            .update({ profile_photo_url: publicUrl })
            .eq('id', userId);

          if (updateError) {
            return { error: { status: 'CUSTOM_ERROR', error: updateError.message } };
          }

          return { data: publicUrl };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useUploadPhotoMutation } = usersApi;
