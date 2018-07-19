  SET ANSI_NULLS ON
  SET QUOTED_IDENTIFIER ON
  CREATE TABLE [dbo].[App_Web_Log] (
      [id] [int] IDENTITY(1,1) NOT NULL,
	  [application] [nvarchar](50) NOT NULL,
	  [logged] [datetime] NOT NULL,	  
	  [level] [nvarchar](50) NOT NULL,
	  [message] [nvarchar](max) NOT NULL,
	  [username] [nvarchar](256) NULL,
	  [request_ip] [nvarchar](256) null,
	  [session] [nvarchar](max) null,
	  [cookie] [nvarchar](max) null,
	  [user_agent] [nvarchar](max) null,
	  [request_method] [varchar](50) null,
	  [url] [nvarchar](max) NULL,
      [query_string] [nvarchar](MAX) NULL,
      [query_form] [nvarchar](MAX) null,
	  [logger] [nvarchar](250) NULL,
	  [callsite] [nvarchar](max) NULL,      
	  [exception] [nvarchar](max) NULL,
      [stack_trace] [nvarchar](max) NULL,
      [api_action] [varchar](256) NULL,
      [sql_text] [nvarchar](MAX) null,
      [elapsed_seconds] [float] NULL,
	  [start_time] [datetime] NULL,
	  [end_time] [datetime] NULL
    CONSTRAINT [PK_App_Web_Log] PRIMARY KEY CLUSTERED ([Id] ASC)
      WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
  ) ON [PRIMARY]
  
