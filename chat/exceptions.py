class ClientError(Exception):
    """
    Custom exception class that is caught by the websocket receive()
    handler and translated into a send back to the client.
    """

    def __init__(self, code):
        super().__init__(code)
        self.code = code


class DontHaveMessagePermission(Exception):
    """
    custom exception raised when a message is sent without having permission
    to send
    """

    def __init__(self, code):
        super(DontHaveMessagePermission, self).__init__(code)
        self.code = code


class ConversationError(Exception):
    """
    custom exception to deal with errors with the conversation module
    """

    def __init__(self, code):
        super(ConversationError, self).__init__(code)
        self.code = code
