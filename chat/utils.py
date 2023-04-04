from django.core.cache import caches



def add_notification(notification, user):
    # check if user has notifications open
    if user.contact.settings.notifications:
        # open cache
        cache = caches['default']
        # get the notification queue from the cache
        notification_queue = cache.get(f'{user.email}_notifications', False)
        # if queue dose'nt exist create a new one
        if not notification_queue:
            notification_queue = list()
        # append the notification in queue
        notification_queue.append(notification)
        # save the new queue in cache
        cache.set(f'{user.email}_notifications', notification_queue)
        # close cache
        cache.close()
