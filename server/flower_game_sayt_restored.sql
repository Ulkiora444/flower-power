--
-- PostgreSQL database dump
--

\restrict 3IHc9iSCZBXkPQkb1MbtwBZ6bZidwtHA5hBhGIxB9tSG5CLELPKNzoPsWp1pPaS

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.market_listings (
    id integer NOT NULL,
    "sellerId" integer NOT NULL,
    kind character varying(16) NOT NULL,
    "speciesId" integer,
    "seedRarity" character varying(24),
    quantity integer NOT NULL,
    "pricePerItem" integer NOT NULL,
    status character varying(16) DEFAULT 'active'::character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.market_listings OWNER TO postgres;

CREATE SEQUENCE public.market_listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_listings_id_seq OWNER TO postgres;

ALTER SEQUENCE public.market_listings_id_seq OWNED BY public.market_listings.id;

CREATE TABLE public.plant_species (
    id integer NOT NULL,
    code character varying NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    rarity character varying(24) NOT NULL,
    "growthMinutes" integer NOT NULL,
    "waterNeedMinutes" integer NOT NULL,
    "wiltAfterMinutes" integer NOT NULL,
    "baseValue" integer NOT NULL,
    "seedPrice" integer NOT NULL,
    color character varying NOT NULL,
    emoji character varying NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.plant_species OWNER TO postgres;

CREATE SEQUENCE public.plant_species_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plant_species_id_seq OWNER TO postgres;

ALTER SEQUENCE public.plant_species_id_seq OWNED BY public.plant_species.id;

CREATE TABLE public.player_flowers (
    id integer NOT NULL,
    "playerId" integer NOT NULL,
    "speciesId" integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.player_flowers OWNER TO postgres;

CREATE SEQUENCE public.player_flowers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_flowers_id_seq OWNER TO postgres;

ALTER SEQUENCE public.player_flowers_id_seq OWNED BY public.player_flowers.id;

CREATE TABLE public.player_plants (
    id integer NOT NULL,
    "playerId" integer NOT NULL,
    "speciesId" integer NOT NULL,
    status character varying(24) DEFAULT 'growing'::character varying NOT NULL,
    "seedRarity" character varying(24) DEFAULT 'common'::character varying NOT NULL,
    health integer DEFAULT 100 NOT NULL,
    "plantedAt" timestamp with time zone NOT NULL,
    "lastWateredAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.player_plants OWNER TO postgres;

CREATE SEQUENCE public.player_plants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_plants_id_seq OWNER TO postgres;

ALTER SEQUENCE public.player_plants_id_seq OWNED BY public.player_plants.id;

CREATE TABLE public.player_seeds (
    id integer NOT NULL,
    "playerId" integer NOT NULL,
    rarity character varying(24) DEFAULT 'common'::character varying NOT NULL,
    "speciesId" integer,
    quantity integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.player_seeds OWNER TO postgres;

CREATE SEQUENCE public.player_seeds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_seeds_id_seq OWNER TO postgres;

ALTER SEQUENCE public.player_seeds_id_seq OWNED BY public.player_seeds.id;

CREATE TABLE public.players (
    id integer NOT NULL,
    "playerKey" character varying NOT NULL,
    name character varying DEFAULT 'Садовник'::character varying NOT NULL,
    coins integer DEFAULT 120 NOT NULL,
    "potSlots" integer DEFAULT 1 NOT NULL,
    "lastDailyAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.players OWNER TO postgres;

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO postgres;

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;

ALTER TABLE ONLY public.market_listings ALTER COLUMN id SET DEFAULT nextval('public.market_listings_id_seq'::regclass);

ALTER TABLE ONLY public.plant_species ALTER COLUMN id SET DEFAULT nextval('public.plant_species_id_seq'::regclass);

ALTER TABLE ONLY public.player_flowers ALTER COLUMN id SET DEFAULT nextval('public.player_flowers_id_seq'::regclass);

ALTER TABLE ONLY public.player_plants ALTER COLUMN id SET DEFAULT nextval('public.player_plants_id_seq'::regclass);

ALTER TABLE ONLY public.player_seeds ALTER COLUMN id SET DEFAULT nextval('public.player_seeds_id_seq'::regclass);

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);

COPY public.market_listings (id, "sellerId", kind, "speciesId", "seedRarity", quantity, "pricePerItem", status, "createdAt", "updatedAt") FROM stdin;
\.


COPY public.plant_species (id, code, name, description, rarity, "growthMinutes", "waterNeedMinutes", "wiltAfterMinutes", "baseValue", "seedPrice", color, emoji, "sortOrder") FROM stdin;
1	sunny-daisy	Солнечная ромашка	Быстро растет, прощает ошибки и дает стабильный старт.	common	10	90	360	25	12	#f7f0a1	🌼	10
2	meadow-poppy	Луговой мак	Простой яркий цветок, который часто вырастает из обычных семян.	common	12	95	360	28	12	#ff7aa8	✿	11
3	ruby-tulip	Рубиновый тюльпан	Редче ромашки, дороже на рынке и требует чуть больше ухода.	rare	18	120	420	48	32	#fb7185	🌷	20
4	azure-hyacinth	Лазурный гиацинт	Редкий прохладный цветок с насыщенным голубым свечением.	rare	22	130	420	56	32	#38bdf8	✾	21
5	moon-orchid	Лунная орхидея	Редкое растение с высоким спросом у коллекционеров.	epic	45	150	480	145	110	#a5b4fc	✦	30
6	crystal-iris	Кристальный ирис	Эпический цветок с прозрачными лепестками и высоким спросом.	epic	52	160	480	165	110	#c084fc	✧	31
7	golden-lotus	Золотой лотос	Древний цветок. Семена появляются редко через бонусы и рынок.	ancient	90	180	540	420	360	#facc15	✹	40
8	elder-lily	Старшая лилия	Древний цветок с тяжелыми лепестками и высокой ценой на рынке.	ancient	105	190	560	470	360	#fde68a	✺	41
9	void-rose	Пустотная роза	Таинственный цветок, который почти невозможно предугадать заранее.	mysterious	150	210	620	900	900	#ff4ec7	✶	50
10	starbell	Звездный колокольчик	Таинственный цветок с мягким сиянием и редким рыночным спросом.	mysterious	165	220	640	980	900	#f0abfc	✷	51
\.

COPY public.player_flowers (id, "playerId", "speciesId", quantity, "updatedAt") FROM stdin;
\.

COPY public.player_plants (id, "playerId", "speciesId", status, "seedRarity", health, "plantedAt", "lastWateredAt", "createdAt", "updatedAt") FROM stdin;
\.

COPY public.player_seeds (id, "playerId", rarity, "speciesId", quantity, "updatedAt") FROM stdin;
\.

COPY public.players (id, "playerKey", name, coins, "potSlots", "lastDailyAt", "createdAt", "updatedAt") FROM stdin;
\.

SELECT pg_catalog.setval('public.market_listings_id_seq', 1, false);

SELECT pg_catalog.setval('public.plant_species_id_seq', 10, true);

SELECT pg_catalog.setval('public.player_flowers_id_seq', 1, false);

SELECT pg_catalog.setval('public.player_plants_id_seq', 1, false);

SELECT pg_catalog.setval('public.player_seeds_id_seq', 1, false);

SELECT pg_catalog.setval('public.players_id_seq', 1, false);

ALTER TABLE ONLY public.plant_species
    ADD CONSTRAINT "PK_1b66e1a64cc1c6921695c08116f" PRIMARY KEY (id);

ALTER TABLE ONLY public.player_plants
    ADD CONSTRAINT "PK_5a6d7a17154e0fc63c745afd788" PRIMARY KEY (id);

ALTER TABLE ONLY public.player_seeds
    ADD CONSTRAINT "PK_a2215b04f128c718d63da614ddc" PRIMARY KEY (id);

ALTER TABLE ONLY public.players
    ADD CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY (id);

ALTER TABLE ONLY public.market_listings
    ADD CONSTRAINT "PK_e60db15c3b56cc6fe625b8dd1d9" PRIMARY KEY (id);

ALTER TABLE ONLY public.player_flowers
    ADD CONSTRAINT "PK_ebfcf0799462318e9d63fcb644b" PRIMARY KEY (id);

ALTER TABLE ONLY public.players
    ADD CONSTRAINT "UQ_4bd8bc8a5d38e0f25624f239ee9" UNIQUE ("playerKey");

ALTER TABLE ONLY public.plant_species
    ADD CONSTRAINT "UQ_92b94fcebf37f3b6cf435b95cd0" UNIQUE (code);

CREATE INDEX "IDX_21fb72d17a558ed7cedd159bbb" ON public.player_seeds USING btree ("playerId", rarity);

CREATE UNIQUE INDEX "IDX_da3b52b29c9f71a26502e6df07" ON public.player_flowers USING btree ("playerId", "speciesId");

ALTER TABLE ONLY public.player_plants
    ADD CONSTRAINT "FK_139a694cd721b6046cc9cea26a9" FOREIGN KEY ("speciesId") REFERENCES public.plant_species(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.market_listings
    ADD CONSTRAINT "FK_1ffaa7a51a8dc0120f37778a514" FOREIGN KEY ("speciesId") REFERENCES public.plant_species(id) ON DELETE RESTRICT;


ALTER TABLE ONLY public.player_flowers
    ADD CONSTRAINT "FK_57a5626e3ff04806282aa3ce8d5" FOREIGN KEY ("speciesId") REFERENCES public.plant_species(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.player_plants
    ADD CONSTRAINT "FK_5db4213ad489c6a1175a4e55dd8" FOREIGN KEY ("playerId") REFERENCES public.players(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.player_flowers
    ADD CONSTRAINT "FK_7cebef0b2b975af060099d25409" FOREIGN KEY ("playerId") REFERENCES public.players(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.player_seeds
    ADD CONSTRAINT "FK_d033de20dd216370a16ce9f9872" FOREIGN KEY ("speciesId") REFERENCES public.plant_species(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.player_seeds
    ADD CONSTRAINT "FK_d8fd5477e3a46c16e28aaf99024" FOREIGN KEY ("playerId") REFERENCES public.players(id) ON DELETE CASCADE;


ALTER TABLE ONLY public.market_listings
    ADD CONSTRAINT "FK_ecaa21aba3772f15a5862ff72f7" FOREIGN KEY ("sellerId") REFERENCES public.players(id) ON DELETE CASCADE;

\unrestrict 3IHc9iSCZBXkPQkb1MbtwBZ6bZidwtHA5hBhGIxB9tSG5CLELPKNzoPsWp1pPaS

