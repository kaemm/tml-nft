DROP TABLE IF EXISTS public.annotations;
DROP TABLE IF EXISTS public.snapshots_nfts;
DROP TABLE IF EXISTS public.snapshots;
DROP TABLE IF EXISTS public.nfts;

-- Table: public.nfts
CREATE TABLE public.nfts
(
    id serial NOT NULL,
    symbol character varying(50) NOT NULL,
    symbol_name character varying(50) NOT NULL,
    symbol_description character varying(300),
    symbol_image character varying(100),
    floor_price numeric,
    listed_count numeric,
    avg_price_24_hrs numeric,
    volume_all numeric,
    PRIMARY KEY (id)
);

-- Table: public.snapshots
CREATE TABLE public.snapshots
(
    snapshot_date timestamp with time zone NOT NULL,
    sol_usd numeric,
    sol_eur numeric,
    PRIMARY KEY (snapshot_date)
);

-- Table: public.snapshots_nfts
CREATE TABLE public.snapshots_nfts
(
    snapshot_date timestamp with time zone NOT NULL,
    nft integer NOT NULL,
    floor_price numeric,
    listed_count numeric,
    avg_price_24_hrs numeric,
    volume_all numeric,
    PRIMARY KEY (snapshot_date, nft),
    CONSTRAINT fk_snapshots_nfts_date FOREIGN KEY (snapshot_date)
        REFERENCES public.snapshots (snapshot_date) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_snapshots_nfts_nft FOREIGN KEY (nft)
        REFERENCES public.nfts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

-- Table: public.annotations
CREATE TABLE public.annotations
(
    id serial NOT NULL,
    label character varying(100) NOT NULL,
    start timestamp NOT NULL,
    end timestamp,
    color character varying(500),
    PRIMARY KEY (id)
);

-- VIEW public.v_nft_data
CREATE OR REPLACE VIEW public.v_nft_data AS
WITH tbl_snapshots AS (
         SELECT s.snapshot_date,
            row_number() OVER (PARTITION BY (date_trunc('day'::text, s.snapshot_date)) ORDER BY s.snapshot_date) AS daily_snapshot_no,
            json_build_object('snapshot_date', date_trunc('second'::text, timezone('Europe/Berlin'::text, s.snapshot_date)), 'sol_usd', round(s.sol_usd, 2), 'sol_eur', round(s.sol_eur, 2), 'nfts', json_object_agg(sn.nft, json_build_object('listed_count', sn.listed_count, 'floor_price', round(sn.floor_price, 3), 'avg_price_24_hrs', round(sn.avg_price_24_hrs, 3), 'floor_usd', round((sn.floor_price * s.sol_usd), 2), 'floor_eur', round((sn.floor_price * s.sol_eur), 2)) ORDER BY sn.nft), 'nft_count', count(sn.nft), 'total_floor', round(sum(sn.floor_price), 2), 'total_floor_usd', round((sum(sn.floor_price) * s.sol_usd), 2), 'total_floor_eur', round((sum(sn.floor_price) * s.sol_eur), 2)) AS snapshots_json
           FROM (snapshots s
             JOIN snapshots_nfts sn ON ((s.snapshot_date = sn.snapshot_date)))
          GROUP BY s.snapshot_date, s.sol_usd, s.sol_eur
          ORDER BY s.snapshot_date
        )
 SELECT json_build_object(
    'nfts', (SELECT json_agg(n.* ORDER BY n.id) AS json_agg
             FROM nfts n),
    'snapshots', (SELECT json_agg(ts.snapshots_json ORDER BY ts.snapshot_date) AS json_agg
                  FROM tbl_snapshots ts
                  WHERE ((ts.daily_snapshot_no = 1) OR (ts.snapshot_date >= (CURRENT_DATE - 30)))),
    'annotations', (SELECT json_agg(a.* ORDER BY a.id) AS json_agg
                    FROM annotations a)
 ) AS data;