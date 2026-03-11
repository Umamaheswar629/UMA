using Domain.Exceptions;

namespace Domain.Tests.Exceptions;

public class ExceptionTests
{
    [Fact]
    public void NotFoundException_ShouldSetMessage_Correctly()
    {
        // Arrange
        var errorMessage = "Item not found in database";

        // Act
        var exception = new NotFoundException(errorMessage);

        // Assert
        Assert.Equal(errorMessage, exception.Message);
    }

    [Fact]
    public void ValidationException_ShouldSetMessage_Correctly()
    {
        // Arrange
        var errorMessage = "Invalid input data";

        // Act
        var exception = new ValidationException(errorMessage);

        // Assert
        Assert.Equal(errorMessage, exception.Message);
    }
}
