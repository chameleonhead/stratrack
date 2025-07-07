using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stratrack.Api.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddDukascopyJobExecution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        migrationBuilder.CreateTable(
            name: "DukascopyJobExecutions",
            columns: table => new
            {
                Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                JobId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ExecutedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_DukascopyJobExecutions", x => x.Id);
            });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        migrationBuilder.DropTable(name: "DukascopyJobExecutions");
        }
    }
}
