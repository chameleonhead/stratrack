using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stratrack.Api.Domain.Migrations
{
    /// <inheritdoc />
    public partial class ChangeExecutionReadModelKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_DukascopyJobExecutions",
                table: "DukascopyJobExecutions");

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "DukascopyJobExecutions",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DukascopyJobExecutions",
                table: "DukascopyJobExecutions",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_DukascopyJobExecutions",
                table: "DukascopyJobExecutions");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "DukascopyJobExecutions");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DukascopyJobExecutions",
                table: "DukascopyJobExecutions",
                column: "ExecutionId");
        }
    }
}
