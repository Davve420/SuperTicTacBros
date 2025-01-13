using Npgsql;

namespace SuperTicTacBros;

public class SuperTicTacBros
{
    
    private Database database = new();
    private NpgsqlDataSource db;
    
    public SuperTicTacBros(WebApplication app)
    {
        db = database.Connection();
        app.MapGet("/api/test", GetTest);
        
    }

    async Task<String> GetTest()
    {
        await using var cmd = db.CreateCommand("SELECT * FROM players");
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                return reader.GetInt32(0) + " " + reader.GetString(1);
            }
        } 
        return "";
    }
}