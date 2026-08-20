export interface paths {
    "/api/public/{eventId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get public event data
         * @description Returns the published event-site data needed to render a custom event website: page metadata, content, theme values, speakers, sessions, sponsors, FAQs, registration form, optional livestream metadata, and photo gallery summary. Image and media fields are returned as resolved public URLs. Registration count and capacity fields are informational and may be briefly stale; the registration submit route remains authoritative.
         */
        get: operations["getPublicEvent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/public/{eventId}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get public event photo gallery
         * @description Returns a paginated list of published photo gallery items with resolved media URLs. Use the main event route photo_gallery object to decide whether to show gallery navigation, then fetch this route for gallery pages or load-more views.
         */
        get: operations["getPublicEventPhotos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/public/{eventId}/attendees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get public attendee display data
         * @description Returns a paginated, public-safe list of approved registration display data for attendee lists or confirmation-page social proof. This route intentionally does not expose email addresses, raw registration data, status, source, or internal metadata.
         */
        get: operations["getPublicEventAttendees"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events/{eventId}/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submit an event registration
         * @description Submit a registration or livestream access form. Fetch GET /api/public/{eventId} first and use the returned form.content.formSchema properties as the keys for request.data. Use form_type 2 for the main registration form and form_type 3 for the livestream access form.
         */
        post: operations["registerForEvent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        NullableString: string | null;
        /** Format: uri */
        NullableUrl: string | null;
        IsoDateString: string | null;
        PublicEvent: {
            id: string;
            name: string;
            subdomain: components["schemas"]["NullableString"];
            /** @description IANA timezone for event date/time display, when configured. */
            timezone: string | null;
            location: components["schemas"]["NullableString"];
            start_date: components["schemas"]["IsoDateString"];
            end_date: components["schemas"]["IsoDateString"];
            type: components["schemas"]["NullableString"];
            event_type: components["schemas"]["NullableString"];
            /**
             * Format: uri
             * @description Resolved public URL for the event logo.
             */
            logo_url: string | null;
            /** @description Whether the published event has livestream content enabled. */
            live_toggle: boolean;
            /** @description Whether the published event has photo gallery content enabled. */
            photos_toggle: boolean;
            metadata: components["schemas"]["PublicEventMetadata"];
            content: components["schemas"]["PublicEventContent"];
            styles: components["schemas"]["PublicEventStyles"];
            display_settings: components["schemas"]["PublicEventDisplaySettings"];
            /** @description Whether custom sites should show add-to-calendar controls where relevant. */
            display_add_to_calendar: boolean;
            /** @description Identifier custom sites use to configure analytics tracking. Null when analytics is not set up for the event. */
            analytics_id: string | null;
        };
        /** @description Published event content with storage-backed image/video fields resolved to public URLs. */
        PublicEventContent: {
            heroImage: components["schemas"]["NullableUrl"];
            heroVideo: components["schemas"]["NullableUrl"];
            heroSection: components["schemas"]["NullableString"];
            overlay: components["schemas"]["NullableString"];
            heroGraphic: components["schemas"]["NullableUrl"];
            companyName: components["schemas"]["NullableString"];
            heroText: components["schemas"]["NullableString"];
            aboutTitle: components["schemas"]["NullableString"];
            aboutDescription: components["schemas"]["NullableString"];
            aboutImage: components["schemas"]["NullableUrl"];
            companyAboutTitle: components["schemas"]["NullableString"];
            companyAboutDescription: components["schemas"]["NullableString"];
            companyAboutImage: components["schemas"]["NullableUrl"];
            agendaTitle: components["schemas"]["NullableString"];
            agendaDescription: components["schemas"]["NullableString"];
            speakersTitle: components["schemas"]["NullableString"];
            speakersDescription: components["schemas"]["NullableString"];
            sponsorsTitle: components["schemas"]["NullableString"];
            sponsorsDescription: components["schemas"]["NullableString"];
            faqsTitle: components["schemas"]["NullableString"];
            faqsDescription: components["schemas"]["NullableString"];
            confirmationTitle: components["schemas"]["NullableString"];
            confirmationDescription: components["schemas"]["NullableString"];
            confirmationImage: components["schemas"]["NullableUrl"];
            displayAttendeesList: boolean | null;
            attendeesListTitle: components["schemas"]["NullableString"];
            attendeesPageSize: number | null;
            attendeesPaginationPosition: components["schemas"]["NullableString"];
        };
        /** @description Published theme values that can be mapped to CSS variables in a custom site. */
        PublicEventStyles: {
            primaryBg: components["schemas"]["NullableString"];
            primaryBgAlt: components["schemas"]["NullableString"];
            primaryText: components["schemas"]["NullableString"];
            secondaryBg: components["schemas"]["NullableString"];
            secondaryBgAlt: components["schemas"]["NullableString"];
            secondaryText: components["schemas"]["NullableString"];
            tertiaryBg: components["schemas"]["NullableString"];
            tertiaryBgAlt: components["schemas"]["NullableString"];
            tertiaryText: components["schemas"]["NullableString"];
            accentBg: components["schemas"]["NullableString"];
            accentBgAlt: components["schemas"]["NullableString"];
            accentText: components["schemas"]["NullableString"];
            baseBg: components["schemas"]["NullableString"];
            baseBgAlt: components["schemas"]["NullableString"];
            baseText: components["schemas"]["NullableString"];
            borderRadius: components["schemas"]["NullableString"];
            fontPrimary: components["schemas"]["NullableString"];
            fontSecondary: components["schemas"]["NullableString"];
        };
        /** @description Published display settings for event detail visibility and CTA buttons. */
        PublicEventDisplaySettings: {
            displayTime: boolean | null;
            displayLocation: boolean | null;
            displayDate: boolean | null;
            hideNavigation: boolean | null;
            /** @description CTA button text and visibility for the hero and navigation. */
            buttonLinks: {
                /** @description Hero section call-to-action button. */
                heroCTA: {
                    text: string;
                    display: boolean;
                };
                /** @description Navigation bar call-to-action button. */
                navCTA: {
                    text: string;
                    display: boolean;
                };
            } | null;
        };
        /** @description Page metadata for SEO and social sharing (Open Graph / Twitter). */
        PublicEventMetadata: {
            /** @description Page title for social sharing and SEO. */
            title: string | null;
            /** @description Page description for social sharing and SEO. */
            description: string | null;
            /**
             * Format: uri
             * @description Resolved public URL for the social share image.
             */
            image_url: string | null;
            /** @description Whether search engines should index the event page. */
            allow_search_engine_indexing: boolean;
        };
        PublicSpeaker: {
            id: string;
            name: string;
            title: components["schemas"]["NullableString"];
            company: components["schemas"]["NullableString"];
            bio: components["schemas"]["NullableString"];
            location: components["schemas"]["NullableString"];
            image_url: components["schemas"]["NullableUrl"];
            website_url: components["schemas"]["NullableString"];
            social_urls: string[];
            order: number | null;
        };
        PublicTrack: {
            id: number;
            name: string;
            is_active: boolean | null;
            color: string;
        };
        PublicSessionSpeaker: {
            speaker_id: string;
            order: number | null;
        };
        PublicSession: {
            id: string;
            name: string;
            description: components["schemas"]["NullableString"];
            location: components["schemas"]["NullableString"];
            start_time: components["schemas"]["IsoDateString"];
            end_time: components["schemas"]["IsoDateString"];
            track_id: number | null;
            speakers: components["schemas"]["PublicSessionSpeaker"][];
        };
        PublicSponsorTier: {
            id: number;
            name: string;
            order: number | null;
        };
        PublicSponsor: {
            id: string;
            name: string;
            description: components["schemas"]["NullableString"];
            website: components["schemas"]["NullableString"];
            logo_url: components["schemas"]["NullableUrl"];
            tier_id: number | null;
            tier: components["schemas"]["PublicSponsorTier"] | null;
            order: number | null;
        };
        PublicFaq: {
            id: number;
            question: string;
            answer: string;
            order: number | null;
        };
        /** @description Form field configuration. Use id as the key when submitting this field in RegistrationRequest.data. */
        PublicFormField: {
            id: string;
            title: string;
            type: string;
            enabled: boolean;
            required: boolean;
            inputType: string;
            /** @default 100 */
            maxLength: number;
            items?: {
                enum: string[];
            };
        };
        /** @description Schema describing custom fields to render and submit. */
        PublicFormSchema: {
            properties: {
                [key: string]: components["schemas"]["PublicFormField"];
            };
        };
        /** @description Published form configuration. Use fieldOrder for display order and formSchema.properties for field IDs, labels, input types, options, and validation metadata. */
        PublicFormContent: {
            fieldOrder: string[];
            formSchema: components["schemas"]["PublicFormSchema"];
        };
        PublicForm: {
            id: number;
            name: string;
            form_title: components["schemas"]["NullableString"];
            form_description: components["schemas"]["NullableString"];
            form_button_text: components["schemas"]["NullableString"];
            content: components["schemas"]["PublicFormContent"];
            /** @description Whether this published form is currently active. */
            is_active: boolean;
            /** @description Maximum approved registrations allowed for this form, or null for no configured cap. */
            max_capacity: number | null;
            /** @description Whether the form is currently at capacity. This is informational; registration submit still enforces capacity server-side. */
            at_capacity: boolean;
            /** @description Current approved registration count. Only populated when max_capacity is set; null otherwise. May be briefly stale because public responses can be cached. */
            registration_count: number | null;
        };
        PublicLivestream: {
            enabled: boolean;
            /** @description Published livestream embed or stream URL. */
            stream_url: string | null;
            /** @description Published livestream chat URL, when configured. */
            chat_url: string | null;
            /** @description Optional livestream access form. Submit it with form_type 3. */
            form: components["schemas"]["PublicForm"] | null;
        };
        PublicMedia: {
            /**
             * Format: uri
             * @description Resolved public URL for the media asset.
             */
            path: string;
            width: number | null;
            height: number | null;
            /**
             * Format: uri
             * @description Resolved public URL for the thumbnail asset, when available.
             */
            thumbnail_path: string | null;
            /**
             * Format: uri
             * @description Resolved public URL for the fallback asset, when available.
             */
            fallback_path: string | null;
            description: components["schemas"]["NullableString"];
        };
        PublicPhoto: {
            id: number;
            order: number;
            media: components["schemas"]["PublicMedia"] | null;
        };
        PublicPhotoGallery: {
            enabled: boolean;
            /** @description Total number of published photos available from the paginated photos endpoint. */
            total_photos: number;
        };
        Pagination: {
            page: number;
            page_size: number;
            total: number;
            total_pages: number;
            has_next_page: boolean;
            has_previous_page: boolean;
        };
        PublicRegistrationAttendee: {
            /** @description Registration ID. */
            id: string;
            first_name: components["schemas"]["NullableString"];
            last_name: components["schemas"]["NullableString"];
            /** @description Public company value derived from approved registration data, or an empty string. */
            company: string;
            /** @description Public title/role value derived from approved registration data, or an empty string. */
            job_title: string;
            created_at: components["schemas"]["IsoDateString"];
        };
        PublicEventApiResponse: {
            event: components["schemas"]["PublicEvent"];
            speakers: components["schemas"]["PublicSpeaker"][];
            tracks: components["schemas"]["PublicTrack"][];
            sessions: components["schemas"]["PublicSession"][];
            sponsors: components["schemas"]["PublicSponsor"][];
            faqs: components["schemas"]["PublicFaq"][];
            form: components["schemas"]["PublicForm"] | null;
            livestream: components["schemas"]["PublicLivestream"] | null;
            photo_gallery: components["schemas"]["PublicPhotoGallery"] | null;
        };
        PublicPhotosApiResponse: {
            photo_gallery: components["schemas"]["PublicPhotoGallery"];
            photos: components["schemas"]["PublicPhoto"][];
            pagination: components["schemas"]["Pagination"];
        };
        PublicRegistrationAttendeesApiResponse: {
            attendees: components["schemas"]["PublicRegistrationAttendee"][];
            pagination: components["schemas"]["Pagination"];
        };
        RegistrationRequest: {
            /** @description ID of the published form being submitted. */
            form_id: number;
            /** @description Registrant's first name. */
            firstName?: string;
            /** @description Registrant's last name. */
            lastName?: string;
            /**
             * Format: email
             * @description Registrant's email address.
             */
            email: string;
            /**
             * @description Custom form field values keyed by field ID from the selected public form content.formSchema.properties. Fetch GET /api/public/{eventId}, read form.content.formSchema for registration forms or livestream.form.content.formSchema for livestream access forms, then submit an object like { "company": "Acme", "jobTitle": "Designer" } using those schema property keys.
             * @default {}
             */
            data: {
                [key: string]: unknown;
            };
            /**
             * @description Registration status. Public registrations are always APPROVED.
             * @default APPROVED
             * @constant
             */
            status: "APPROVED";
            /**
             * @description Event environment to register against. Use staging for the draft/preview event state and prod for the published event state.
             * @enum {string}
             */
            env: "staging" | "prod";
            /** @description Form type being submitted. 2 = registration, 3 = livestream access. */
            form_type: 2 | 3;
        };
        RegistrationResponse: {
            /** @constant */
            success: true;
            registration: {
                id: string;
                /** Format: email */
                email: string;
                status: string;
                created_at: string;
                registration_number: number | null;
            };
        };
        PublicApiError: {
            error: string;
            code?: string;
            details?: unknown;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getPublicEvent: {
        parameters: {
            query: {
                /** @description Use "staging" for draft/preview event data and "prod" for the published event. */
                env: "staging" | "prod";
            };
            header?: never;
            path: {
                /** @description Happily event ID. */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Public event data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicEventApiResponse"];
                };
            };
            /** @description Missing or invalid query parameters. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Event does not have public API access. Access requires the Pro plan or the Custom Site permission. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Event not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Too many requests. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Failed to fetch public event data. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
        };
    };
    getPublicEventPhotos: {
        parameters: {
            query: {
                /** @description Use "staging" for draft/preview event data and "prod" for the published event. */
                env: "staging" | "prod";
                /** @description Page number for paginated routes. Pages start at 1. */
                page?: number;
                /** @description Number of records to return per page. Maximum is 100. */
                page_size?: number;
            };
            header?: never;
            path: {
                /** @description Happily event ID. */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated photo gallery data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicPhotosApiResponse"];
                };
            };
            /** @description Invalid query parameters. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Event does not have public API access. Access requires the Pro plan or the Custom Site permission. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Event or photo gallery not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Too many requests. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Failed to fetch photo gallery data. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
        };
    };
    getPublicEventAttendees: {
        parameters: {
            query: {
                /** @description Use "staging" for draft/preview event data and "prod" for the published event. */
                env: "staging" | "prod";
                /** @description Page number for paginated routes. Pages start at 1. */
                page?: number;
                /** @description Number of records to return per page. Maximum is 100. */
                page_size?: number;
            };
            header?: never;
            path: {
                /** @description Happily event ID. */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated attendee display data. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicRegistrationAttendeesApiResponse"];
                };
            };
            /** @description Invalid query parameters. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Event does not have public API access. Access requires the Pro plan or the Custom Site permission. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Event not found or attendee list is not enabled. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Too many requests. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Failed to fetch attendee data. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
        };
    };
    registerForEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Happily event ID. */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationRequest"];
            };
        };
        responses: {
            /** @description Registration accepted. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationResponse"];
                };
            };
            /** @description Invalid registration request, capacity reached, duplicate email, or another registration error. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Too many requests. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
            /** @description Unexpected registration error. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicApiError"];
                };
            };
        };
    };
}
