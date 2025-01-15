create table players
(
    id       serial
        constraint players_pk
            primary key,
    name     text not null,
    clientid text not null
);

alter table players
    owner to postgres;

create unique index players_name_uindex
    on players (name);

create table games
(
    id       serial
        constraint games_pk
            primary key,
    player_1 integer not null
        constraint games_players_id_fk
            references players,
    player_2 integer not null
        constraint games_players_id_fk2
            references players,
    gamecode text
);

alter table games
    owner to postgres;

create table moves
(
    tile   integer not null,
    player integer not null
        constraint moves_players_id_fk
            references players,
    game   integer not null
        constraint moves_games_id_fk
            references games
);

alter table moves
    owner to postgres;

create index moves_tile_game_index
    on moves (tile, game);

CREATE TABLE questions (
                           id SERIAL PRIMARY KEY,
                           question TEXT NOT NULL,
                           answer TEXT NOT NULL
);


INSERT INTO questions (question, answer) VALUES
                                             ('Vad heter prinsessan som Mario räddar?', 'Peach'),
                                             ('Vad är namnet på Marios dinosaurievän?', 'Yoshi'),
                                             ('Vad är Marios yrke?', 'Rörmokare'),
                                             ('Vad är huvudstaden i Sverige?', 'Stockholm'),
                                             ('Hur många dagar har ett år?', '365'),
                                             ('Vilken färg har himlen en solig dag?', 'blå'),
                                             ('Vad är huvudstaden i Norge?', 'Oslo'),
                                             ('Vilken färg får blad på hösten?', 'orange'),
                                             ('Hur många ben har en spindel?', '8'),
                                             ('Vad är 5 + 5?', '10'),
                                             ('Vilket århundrade är vi i nu?', '2000-talet'),
                                             ('Vad heter den största planeten i vårt solsystem?', 'Jupiter'),
                                             ('Vad är huvudstaden i Frankrike?', 'Paris'),
                                             ('Vilken färg har solen?', 'gul'),
                                             ('Hur många sekunder finns i en minut?', '60'),
                                             ('Vad heter världens längsta flod?', 'Nilen'),
                                             ('Vad är det kemiska tecknet för vatten?', 'H2O'),
                                             ('Hur många månader har ett år?', '12'),
                                             ('Vad heter världens snabbaste landdjur?', 'Gepard'),
                                             ('Vilket språk talar man i Brasilien?', 'Portugisiska'),
                                             ('Vad är det största havet på jorden?', 'Stilla havet'),
                                             ('Hur många planeter finns i vårt solsystem?', '8'),
                                             ('Vad är huvudstaden i Italien?', 'Rom'),
                                             ('Vilket är världens högsta berg?', 'Mount Everest'),
                                             ('Vilken metall används ofta för att göra smycken?', 'Guld'),
                                             ('Vad är 7 x 8?', '56'),
                                             ('Vad heter huvudpersonen i berättelsen om Sherlock Holmes?', 'Sherlock'),
                                             ('Vilken färg har en mogen banan?', 'gul'),
                                             ('Hur många veckor finns i ett år?', '52'),
                                             ('Vad är huvudstaden i Tyskland?', 'Berlin'),
                                             ('Vilken planet är närmast solen?', 'Merkurius'),
                                             ('Vad heter den största ön i världen?', 'Grönland'),
                                             ('Vilket djur är känt för sin långsamma rörelse?', 'Sengångare'),
                                             ('Hur många hjul har en bil?', '4'),
                                             ('Vad är huvudstaden i Danmark?', 'Köpenhamn'),
                                             ('Vad heter månen som kretsar runt jorden?', 'Månen'),
                                             ('Hur många timmar finns i en dag?', '24'),
                                             ('Vilken gas andas vi in för att leva?', 'Syre'),
                                             ('Vad är huvudstaden i Spanien?', 'Madrid'),
                                             ('Vilket djur kallas ofta människans bästa vän?', 'Hund'),
                                             ('Vad är namnet på vår galax?', 'Vintergatan'),
                                             ('Hur många år har ett decennium?', '10'),
                                             ('Vad är huvudstaden i USA?', 'Washington, D.C.'),
                                             ('Vilken metall är flytande vid rumstemperatur?', 'Kvicksilver'),
                                             ('Vad heter världens minsta land?', 'Vatikanstaten'),
                                             ('Hur många färger finns i regnbågen?', '7');