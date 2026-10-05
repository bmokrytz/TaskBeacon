moved {
    from    = aws_lb.main
    to      = aws_lb.main[0]
}

moved {
    from    = aws_lb_target_group.api
    to      = aws_lb_target_group.api[0]
}

moved {
    from    = aws_lb_listener.http
    to      = aws_lb_listener.http[0]
}

moved {
    from    = aws_lb_listener.https
    to      = aws_lb_listener.https[0]
}

moved {
    from    = aws_lb_listener_rule.api
    to      = aws_lb_listener_rule.api[0]
}

moved {
    from    = aws_ecs_service.api
    to      = aws_ecs_service.api[0]
}

moved {
    from    = aws_appautoscaling_target.ecs_target
    to      = aws_appautoscaling_target.ecs_target[0]
}

moved {
    from    = aws_appautoscaling_policy.ecs_policy_cpu
    to      = aws_appautoscaling_policy.ecs_policy_cpu[0]
}