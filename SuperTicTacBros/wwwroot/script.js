let player = null;
let game = null;
let playedTiles = [];
let currentQuestion = null;
let canPlay = false;

// refresh is a sequence to handle reflecting the current game state for any connected user
async function refresh() {
    if (!player) {
        $('#add-player').show()
    } else {
        $('#add-player').hide()
        if (!game) {
            $('#add-game').show()
        } else {
            $('#add-game').hide()
        }
    }

    if (!player || !game) {
        $('#tictactoe input').prop('disabled', true);
    } else {
        let timeout = setTimeout(async function () {
            const response = await fetch('/api/played-tiles/' + game.id);
            const playedTilesUpdate = await response.json();
            if (playedTilesUpdate != playedTiles) {
                playedTiles = playedTilesUpdate
                showPlayableTiles(playedTiles)
                tellTurn(playedTiles)
            }

            if (await checkWin(game)) {
                clearTimeout(timeout);
                return;
            }
            await refresh()
        }, 300)
    }

    // Kontrollera spelstatus och frågor
    if (game) {
        const playersResponse = await fetch('/api/check-players/' + game.id);
        const players = await playersResponse.json();

        if (!players.bothConnected) {
            $('#message2').html('<strong>Väntar på andra spelaren...</strong>');
            $('#answer-form').removeClass('active');
            currentQuestion = null;
            currentQuestionId = null;
            return;
        }

        // Visa ny fråga endast om det inte finns en aktiv fråga och båda spelarna är anslutna
        if (!currentQuestion && !canPlay && players.bothConnected) {
            await getNewQuestion();
        }

        // Kontrollera om motståndaren har svarat
        if (currentQuestionId && !canPlay) {
            const checkAnswer = await fetch(`/api/check-question/${game.id}/${currentQuestionId}`);
            const answerStatus = await checkAnswer.json();
            if (answerStatus.answered) {
                $('#answer-form').removeClass('active');
                $('#message2').html(`<strong>Andra spelaren svarade rätt först!</strong>`);
                $('#message').text('Vänta på din tur...');
                currentQuestion = null;
                currentQuestionId = null;
            }
        }
    }
}

// first call refresh when page has loaded to reflect inital state / rebuild current state
refresh()


function showPlayableTiles(playedTiles) {
    const playedTilesHash = {}
    for (let tile of playedTiles) {
        playedTilesHash[tile.tile] = tile
    }
    // Aktivera alla rutor som inte är tagna
    $('#tictactoe input').prop('disabled', false);
    $('#tictactoe input').each(function () {
        let tile = playedTilesHash[$(this).index()];
        if (tile?.tile > -1) {
            $(this).prop('disabled', true);
            if (tile.player === player.id) {
                $(this).val(player.tile)
            } else {
                $(this).val(player.tile === 'X' ? 'O' : 'X')
            }
        }
    })
}

function tellTurn(playedTiles) {
    let yourMoves = 0;
    let otherMoves = 0;
    for (let tile of playedTiles) {
        if (tile.player === player.id) {
            yourMoves++
        } else {
            otherMoves++
        }
    }

    // Om spelaren har svarat rätt på frågan, låt dem spela oavsett X eller O
    if (canPlay) {
        $('#message').text('Du svarade rätt! Din tur att lägga!');
        $('#tictactoe input:not([value])').prop('disabled', false);
    } else {
        $('#message').text('Svara rätt på frågan för att få lägga!');
        $('#tictactoe input').prop('disabled', true);
    }
}

async function checkWin() {
    const response = await fetch('/api/check-win/' + game.id);
    const win = await response.json();
    if (win) {
        $('#message').text('Raden ' + win.join(' - ') + ' vann!')
        // disable tiles
        $('#tictactoe input').prop('disabled', true);
        // show winning row
        $('#tictactoe input').each(function () {
            if (win.includes($(this).index())) {
                $(this).css('background-color', 'yellow')
            }
        })
        return true;
    }
    return false;
}


$('#add-player').on('submit', addPlayer) // onsubmit for the addPlayer form

async function addPlayer(e) {
    e.preventDefault()
    const playerName = $('#add-player>[name="name"]').val()
    const response = await fetch('/api/add-player/', { // post
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName })
    });
    player = await response.json();
    $('#message').text(player.name + ' was added to the game')
    refresh()
}

$('#add-game').on('submit', addGame) // onsubmit for the addGame form

async function addGame(e) {
    e.preventDefault()
    const gamecode = $('#add-game>[name="gamecode"]').val()
    const response = await fetch('/api/current-game/' + gamecode)
    game = await response.json();
    player.tile = (player.id === game.player_1) ? 'X' : 'O';

    if (game) {
        $('#message').text('Ansluten till spel: ' + game.gamecode);
        $('#message2').html('<strong>Väntar på andra spelaren...</strong>');
        $('#answer-form').removeClass('active');
    } else {
        $('#message').text('Hittade inget spel med koden ' + gamecode);
    }
    await refresh();
}

$('#tictactoe>input').off('click').on('click', async function () {
    if (!canPlay) {
        $('#message2').text('Du måste svara rätt på frågan först!');
        return;
    }

    let tileIndex = $(this).index();
    const response = await fetch('/api/play-tile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tile: tileIndex,
            player: player.id,
            game: game.id
        })
    });

    const moveAccepted = await response.json();
    if (moveAccepted) {
        $(this).val(player.tile);
        $('#message').text('Drag accepterat!');
        canPlay = false;
        currentQuestion = null;
        currentQuestionId = null;
        $('#message2').html('');
        $('#answer-form').removeClass('active');
        $('#tictactoe input').prop('disabled', true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await getNewQuestion();
    } else {
        $('#message').text('Denna ruta är redan tagen');
    }
    await refresh();
});


$('#answer-form').on('submit', async function (e) {
    e.preventDefault();
    const answer = $('#answer-form input[name="answer"]').val();

    if (answer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
        canPlay = true;
        $('#message').html('<strong>Rätt svar!</strong> Din tur att spela!');
        $('#answer-form').removeClass('active');
        $('#tictactoe input:not([value])').prop('disabled', false);
        $('#answer-form input[name="answer"]').val('');

        // Spara i databasen att denna fråga är besvarad
        await fetch('/api/answer-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: currentQuestionId,
                gameId: game.id,
                playerId: player.id
            })
        });

        // Andra spelaren ska se att de förlorade racet
        $('#message2').html(`<strong>Du svarade rätt först!</strong>`);
    } else {
        $('#message').text('Fel svar! Försök igen!');
    }
});

