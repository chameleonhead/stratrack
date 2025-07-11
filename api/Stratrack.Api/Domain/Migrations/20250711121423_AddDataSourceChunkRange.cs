using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stratrack.Api.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddDataSourceChunkRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndTime",
                table: "DataSources",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartTime",
                table: "DataSources",
                type: "datetimeoffset",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "DataSources");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "DataSources");
        }
    }
}
