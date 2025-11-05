import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import supabaseClient from '../../services/supabase';

export interface ConnectionRequest {
  id: string;
  sponsee_id: string;
  sponsor_id: string;
  introduction_message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  decline_reason?: string;
  responded_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  sponsee_name?: string;
  sponsee_photo_url?: string;
  sponsor_name?: string;
  sponsor_photo_url?: string;
}

export interface Connection {
  id: string;
  sponsee_id: string;
  sponsor_id: string;
  connection_request_id?: string;
  status: 'active' | 'disconnected';
  connected_at: string;
  disconnected_at?: string;
  last_contact?: string;
  // Joined data
  sponsee_name?: string;
  sponsee_photo_url?: string;
  sponsor_name?: string;
  sponsor_photo_url?: string;
  sponsee_step_progress?: number;
  sponsor_years_sober?: number;
}

export interface SendRequestPayload {
  sponsor_id: string;
  introduction_message?: string;
}

export interface AcceptRequestPayload {
  request_id: string;
}

export interface DeclineRequestPayload {
  request_id: string;
  reason?: string;
}

export interface DisconnectPayload {
  connection_id: string;
}

export const connectionsApi = createApi({
  reducerPath: 'connectionsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['ConnectionRequests', 'Connections'],
  endpoints: builder => ({
    // Send connection request (T073)
    sendRequest: builder.mutation<ConnectionRequest, SendRequestPayload>({
      queryFn: async ({ sponsor_id, introduction_message }) => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('connection_requests')
            .insert({
              sponsee_id: user.id,
              sponsor_id,
              introduction_message,
              status: 'pending',
            })
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as ConnectionRequest };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['ConnectionRequests'],
    }),

    // Get pending requests (sponsor view) (T074)
    getPendingRequests: builder.query<ConnectionRequest[], void>({
      queryFn: async () => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('connection_requests')
            .select(
              `
              *,
              sponsee:users!sponsee_id(id, name, profile_photo_url)
            `,
            )
            .eq('sponsor_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          // Flatten joined data
          const requests = (data || []).map((req: any) => ({
            ...req,
            sponsee_name: req.sponsee?.name,
            sponsee_photo_url: req.sponsee?.profile_photo_url,
          }));

          return { data: requests as ConnectionRequest[] };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: ['ConnectionRequests'],
    }),

    // Accept connection request (T075)
    acceptRequest: builder.mutation<Connection, AcceptRequestPayload>({
      queryFn: async ({ request_id }) => {
        try {
          // Start transaction: update request + create connection
          const { data: request, error: requestError } = await supabaseClient
            .from('connection_requests')
            .update({
              status: 'accepted',
              responded_at: new Date().toISOString(),
            })
            .eq('id', request_id)
            .select()
            .single();

          if (requestError) {
            return { error: { status: 400, data: { message: requestError.message } } };
          }

          const { data: connection, error: connectionError } = await supabaseClient
            .from('connections')
            .insert({
              sponsee_id: request.sponsee_id,
              sponsor_id: request.sponsor_id,
              connection_request_id: request_id,
              status: 'active',
            })
            .select()
            .single();

          if (connectionError) {
            return { error: { status: 400, data: { message: connectionError.message } } };
          }

          return { data: connection as Connection };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['ConnectionRequests', 'Connections'],
    }),

    // Decline connection request (T076)
    declineRequest: builder.mutation<void, DeclineRequestPayload>({
      queryFn: async ({ request_id, reason }) => {
        try {
          const { error } = await supabaseClient
            .from('connection_requests')
            .update({
              status: 'declined',
              decline_reason: reason,
              responded_at: new Date().toISOString(),
            })
            .eq('id', request_id);

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['ConnectionRequests'],
    }),

    // View sent requests (sponsee view) (T077)
    getSentRequests: builder.query<ConnectionRequest[], void>({
      queryFn: async () => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('connection_requests')
            .select(
              `
              *,
              sponsor:users!sponsor_id(id, name, profile_photo_url)
            `,
            )
            .eq('sponsee_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          // Flatten joined data
          const requests = (data || []).map((req: any) => ({
            ...req,
            sponsor_name: req.sponsor?.name,
            sponsor_photo_url: req.sponsor?.profile_photo_url,
          }));

          return { data: requests as ConnectionRequest[] };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: ['ConnectionRequests'],
    }),

    // Cancel pending request (T078)
    cancelRequest: builder.mutation<void, string>({
      queryFn: async request_id => {
        try {
          const { error } = await supabaseClient
            .from('connection_requests')
            .update({ status: 'cancelled' })
            .eq('id', request_id)
            .eq('status', 'pending');

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['ConnectionRequests'],
    }),

    // View active connections (T079)
    getConnections: builder.query<Connection[], void>({
      queryFn: async () => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('connections')
            .select(
              `
              *,
              sponsee:users!sponsee_id(id, name, profile_photo_url),
              sponsor:users!sponsor_id(id, name, profile_photo_url),
              sponsee_profile:sponsee_profiles!sponsee_id(step_progress),
              sponsor_profile:sponsor_profiles!sponsor_id(years_sober)
            `,
            )
            .or(`sponsee_id.eq.${user.id},sponsor_id.eq.${user.id}`)
            .eq('status', 'active')
            .order('connected_at', { ascending: false });

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          // Flatten joined data
          const connections = (data || []).map((conn: any) => ({
            ...conn,
            sponsee_name: conn.sponsee?.name,
            sponsee_photo_url: conn.sponsee?.profile_photo_url,
            sponsor_name: conn.sponsor?.name,
            sponsor_photo_url: conn.sponsor?.profile_photo_url,
            sponsee_step_progress: conn.sponsee_profile?.step_progress,
            sponsor_years_sober: conn.sponsor_profile?.years_sober,
          }));

          return { data: connections as Connection[] };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: ['Connections'],
    }),

    // Disconnect connection (T081)
    disconnect: builder.mutation<void, DisconnectPayload>({
      queryFn: async ({ connection_id }) => {
        try {
          const { error } = await supabaseClient
            .from('connections')
            .update({
              status: 'disconnected',
              disconnected_at: new Date().toISOString(),
            })
            .eq('id', connection_id)
            .eq('status', 'active');

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['Connections'],
    }),
  }),
});

export const {
  useSendRequestMutation,
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  useGetSentRequestsQuery,
  useCancelRequestMutation,
  useGetConnectionsQuery,
  useDisconnectMutation,
} = connectionsApi;
